// src/app/hooks/useMultiImageGenerator.tsx
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import * as htmlToImage from "html-to-image";

/**
 * Configuráveis:
 * - imageWidth: largura alvo da imagem em px (ex: 1080 para Instagram story/feed)
 * - maxHeight: altura padrão a tentar (ex: 1920). Quando uma sentença for maior, permitimos altura maior.
 * - pixelRatioMultiplier: para gerar imagens com qualidade (ex: 2 para retina-like)
 */
type Options = {
  imageWidth?: number;
  maxHeight?: number;
  pixelRatioMultiplier?: number;
};

export function useMultiImageGenerator(opts?: Options) {
  const options = {
    imageWidth: opts?.imageWidth ?? 1080,
    maxHeight: opts?.maxHeight ?? 1920,
    pixelRatioMultiplier: opts?.pixelRatioMultiplier ?? 1.5,
  };

  // containerRef guarda o div off-screen onde vamos renderizar o componente visual.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any>(null); // react-root criado dinamically

  // Helper para criar o container off-screen (single instance, reaproveitado)
  function ensureContainer() {
    if (containerRef.current) return containerRef.current;

    const c = document.createElement("div");
    // posiciona off-screen mas ainda renderizável (não display:none)
    c.style.position = "fixed";
    c.style.left = "-9999px";
    c.style.top = "0px";
    c.style.width = `${options.imageWidth}px`;
    c.style.pointerEvents = "none";
    // optional: ensure it's above and not affected by body transforms
    document.body.appendChild(c);

    // create react root to render components into it
    rootRef.current = createRoot(c);
    containerRef.current = c;
    return c;
  }

  // split text into sentences (basic). Mantém quebras de linha como paragrafos.
  function splitIntoSentences(text: string) {
    // Primeiro preserva parágrafos
    const paragraphs = text.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
    const out: string[] = [];
    const sentenceRegex = /[^.!?…]+[.!?…]*/g; // pega sentenças incluindo pontuação
    for (const p of paragraphs) {
      const sentences = p.match(sentenceRegex);
      if (sentences && sentences.length) {
        // adiciona sentenças do parágrafo e sinaliza fim de parágrafo com \n\n
        for (const s of sentences) out.push(s.trim());
        // marca explicitamente quebra de parágrafo como sentenca vazia (opcional)
        out.push("\n\n");
      } else {
        out.push(p);
        out.push("\n\n");
      }
    }
    // remove trailing \n\n se existir
    if (out.length && out[out.length - 1] === "\n\n") out.pop();
    return out;
  }

  // UTIL: small helper para aguardar próxima frame
  const raf = () => new Promise((res) => requestAnimationFrame(() => res(null)));

  /**
   * main function: recebe um React element factory que renderiza o card (com props texto)
   * renderFactory = (texto: string) => <GospelShareImage texto={texto} referencia={...} />
   *
   * retorna Promise<File[]> (array de imagens geradas)
   */
  async function generateImagesFromText(
    fullText: string,
    renderFactory: (texto: string) => React.ReactElement,
    filenamePrefix = "gospel"
  ): Promise<File[]> {
    // garante fonts carregadas (evita imagens sem fonts)
    if ((document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready;
    }

    const container = ensureContainer();

    // Splitting pass: vamos construir chunks testando no DOM
    const sentences = splitIntoSentences(fullText);

    const chunks: string[] = [];
    let current = "";

    // Função auxiliar que renderiza `currentCandidate` e mede scrollHeight
    async function measureHeight(candidate: string) {
      // render react element com o texto no container using rootRef
      // usamos renderFactory para manter markup igual ao GospelShareImage original
      rootRef.current.render(renderFactory(candidate));
      // espera o browser aplicar
      await raf();
      // leitura do scrollHeight
      const h = container.scrollHeight;
      return h;
    }

    // Iterate over sentences and group them into chunks that fit maxHeight
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      const trial = current ? (current + (current.endsWith("\n\n") ? "" : " ") + s) : s;

      const h = await measureHeight(trial);

      if (h <= options.maxHeight) {
        current = trial;
      } else {
        // excedeu o limite
        if (!current) {
          // caso raro: uma única sentença sozinha já excede a altura padrão
          // vamos aceitar essa sentença como um chunk próprio (permitindo altura maior)
          chunks.push(s);
          current = "";
        } else {
          // confirma current como chunk e começa novo com s
          chunks.push(current);
          current = s;
        }
      }
    }

    if (current) chunks.push(current);

    // Geração das imagens: iteramos sobre chunks, renderizamos e chamamos html-to-image
    const files: File[] = [];
    let idx = 0;
    for (const chunk of chunks) {
      idx++;
      // render chunk
      rootRef.current.render(renderFactory(chunk));
      await raf();

      // prepare options for html-to-image; usamos toBlob para receber Blob
      const blob = await htmlToImage.toBlob(container, {
        // configurações úteis
        width: options.imageWidth,
        // height não precisa ser passada; html-to-image renderiza inteiro
        pixelRatio: (window.devicePixelRatio || 1) * options.pixelRatioMultiplier,
        // backgroundColor: "#fff" // opcional: garantir fundo
      });

      if (!blob) throw new Error("Falha ao gerar imagem (blob vazio).");

      // cria File com nome legível
      const ext = blob.type.includes("jpeg") ? "jpg" : "png";
      const file = new File([blob], `${filenamePrefix}_${idx}.${ext}`, {
        type: blob.type,
      });

      files.push(file);

      // opcional: breve pausa para liberar thread
      await new Promise((r) => setTimeout(r, 50));
    }

    // cleanup: desmonta react root e remove container
    try {
      rootRef.current.unmount();
    } catch (e) {
      // ignore
    }
    if (container.parentNode) container.parentNode.removeChild(container);
    containerRef.current = null;
    rootRef.current = null;

    return files;
  }

  return {
    generateImagesFromText,
  };
}
