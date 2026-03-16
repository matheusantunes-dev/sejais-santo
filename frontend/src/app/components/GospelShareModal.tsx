// src/app/components/GospelShareModal.tsx
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image"; // usar toBlob é mais eficiente que toPng+fetch
import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, waitForNextPaint, shareFiles } from "../share/shareUtils";
import "./ShareComposer.css";

interface GospelData {
  referencia: string;
  texto: string;
}

interface GospelShareModalProps {
  open: boolean;
  onClose: () => void;
  gospel: GospelData | null;
}

interface GeneratedImageLink {
  name: string;
  url: string;
}

/* helpers para dividir texto em "páginas" (mantive a sua lógica, polida) */
function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? [];
}

function buildChunks(text: string) {
  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let current = "";
  const MAX_CHARS = 900; // limite por "página" — ajuste conforme layout
  for (const sentence of sentences) {
    // se ao adicionar a sentença excede e já tem um tamanho base, empurra chunk
    if ((current + sentence).length > MAX_CHARS && current.length > 200) {
      chunks.push(current.trim());
      current = `${sentence} `;
    } else {
      current += `${sentence} `;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.trim()];
}

/* Componente exportado (named export) */
export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[1];

  // estados
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);

  // preview texto (primeira "página")
  const previewText = useMemo(() => {
    if (!gospel) return "";
    return buildChunks(gospel.texto)[0] ?? gospel.texto;
  }, [gospel]);

  // reset quando abre modal
  useEffect(() => {
    if (!open) return;
    setSelectedTemplateId(defaultTemplate.id);
    setBackgroundSrc(defaultTemplate.src);
    setCustomFileName("");
    setRenderText(previewText);
  }, [defaultTemplate.id, defaultTemplate.src, open, previewText]);

  if (!open || !gospel || typeof document === "undefined") return null;

  function handleTemplateSelect(template: ShareTemplate) {
    setSelectedTemplateId(template.id);
    setBackgroundSrc(template.src);
    setCustomFileName("");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedTemplateId(null);
      setBackgroundSrc(dataUrl);
      setCustomFileName(file.name);
    } catch (error) {
      console.error("Erro ao carregar imagem personalizada:", error);
      alert("Não foi possível carregar a imagem escolhida.");
    } finally {
      // limpa input para permitir reupload do mesmo arquivo
      event.target.value = "";
    }
  }

  /* Gera arquivos (File[]) a partir das "páginas" do evangelho.
     Otimizações:
     - usa toBlob direto (evita criar dataURL e depois fetch)
     - espera o próximo paint antes de capturar cada página
     - usa pixelRatio controlado (mais rápido se reduzir)
  */
  async function generateFiles(): Promise<File[]> {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel.texto);
    const files: File[] = [];

    // escolha de pixelRatio: balance entre qualidade e tempo
    // 1 é rápido; 2 é alta resolução. Ajuste conforme necessidade.
    const safePixelRatio = Math.min(1.5, window.devicePixelRatio || 1);

    for (let index = 0; index < chunks.length; index += 1) {
      setRenderText(chunks[index]); // atualiza o texto que o GospelShareImage renderiza
      // garante que o DOM pintou com o novo texto antes do snapshot
      await waitForNextPaint();

      // usa toBlob que é mais eficiente do que gerar dataURL e fetch
      const blob = await toBlob(captureRef.current, {
        pixelRatio: safePixelRatio,
        skipFonts: false, // se você quer preservar fontes custom, false; para mais speed, true (testar)
        cacheBust: true,
      });

      if (!blob) {
        console.warn("[GospelShareModal] toBlob retornou null para a página", index + 1);
        continue;
      }

      const fileName = `evangelho-${index + 1}.png`;
      files.push(
        new File([blob], fileName, {
          type: "image/png",
        })
      );

      // pequena pausa cooperativa para aliviar o event loop em textos muito longos
      // (opcional: melhora responsividade, evita travar UI com N páginas grandes)
      // await new Promise((r) => setTimeout(r, 20));
    }

    return files;
  }

  /* Função de compartilhar — estritamente: gera arquivos, tenta compartilhar.
     Não gera links ou força download. Se não suportar, avisa o usuário.
  */
  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const files = await generateFiles();

      if (!files.length) {
        throw new Error("Nenhuma imagem gerada.");
      }

      // Detecta suporte a share de arquivos. Faz chamada segura a canShare.
      const hasNavigatorShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
      let canShareFiles = false;
      try {
        canShareFiles =
          hasNavigatorShare &&
          typeof (navigator as any).canShare === "function" &&
          (navigator as any).canShare({ files });
      } catch (err) {
        // alguns browsers lançam ao chamar canShare; tratamos como 'não suporta'
        console.warn("[GospelShareModal] navigator.canShare lançou:", err);
        canShareFiles = false;
      }

      if (!hasNavigatorShare || !canShareFiles) {
        // política sua: NÃO mostrar fallback — apenas informar e encerrar
        alert("Seu navegador não suporta compartilhamento de arquivos. Abra no Chrome/Safari para compartilhar imagens.");
        return;
      }

      // chama share; se o usuário cancelar, será capturado como DOMException/AbortError
      try {
        await navigator.share({
          files,
          title: "Evangelho do Dia",
          text: gospel.referencia,
        });
      } catch (err: any) {
        // se o usuário cancelou, não queremos tratar como erro fatal.
        if (err && err.name === "AbortError") {
          console.info("[GospelShareModal] compartilhamento cancelado pelo usuário.");
        } else {
          console.error("[GospelShareModal] error sharing files:", err);
          alert("Erro ao tentar compartilhar. Veja o console para detalhes.");
        }
      }

      onClose();
    } catch (error) {
      console.error("[GospelShareModal] handleShare erro:", error);
      alert("Não foi possível compartilhar o evangelho.");
    } finally {
      // restaura preview e estado
      setRenderText(previewText);
      setIsSharing(false);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="share-composer-close" onClick={onClose}>
          x
        </button>

        <div className="share-composer-header">
          <h3>Compartilhar Evangelho</h3>
        </div>

        <div className="share-composer-layout">
          <div className="share-composer-preview is-portrait">
            <GospelShareImage
              referencia={gospel.referencia}
              texto={previewText}
              backgroundSrc={backgroundSrc}
              width={252}
            />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading="Fundos do Evangelho"
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
            />

            <div className="share-composer-actions">
              <button type="button" className="share-composer-button share-composer-button--secondary" onClick={onClose}>
                Fechar
              </button>

              <button
                type="button"
                className="share-composer-button share-composer-button--primary"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 size={18} />
                {isSharing ? "Gerando..." : "Compartilhar"}
              </button>
            </div>
          </div>
        </div>

        {/* hidden capture root: usado para gerar as imagens reais; GospelShareImage deve aceitar ref */}
        <div className="hidden-capture-root" aria-hidden="true">
          <GospelShareImage
            ref={captureRef as any}
            referencia={gospel.referencia}
            texto={renderText || previewText}
            backgroundSrc={backgroundSrc}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
