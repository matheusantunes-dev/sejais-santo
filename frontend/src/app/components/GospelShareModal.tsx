import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, waitForNextPaint } from "../share/shareUtils";
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

/* --- texto -> sentenças -> chunks (divide o texto em páginas) --- */
function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? [];
}

function buildChunks(text: string) {
  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let current = "";
  const MAX_CHARS = 900;

  for (const sentence of sentences) {
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

/* --- Componente principal (arquivo completo) --- */
export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[1];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    defaultTemplate.id
  );
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");

  const captureRef = useRef<HTMLDivElement>(null);

  const previewText = useMemo(() => {
    if (!gospel) return "";
    return buildChunks(gospel.texto)[0] ?? gospel.texto;
  }, [gospel]);

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
    } catch (err) {
      console.error("Erro ao ler arquivo do usuário:", err);
      alert("Não foi possível carregar a imagem escolhida.");
    } finally {
      event.target.value = "";
    }
  }

  /* Gera 1..N arquivos PNG a partir do componente oculto */
  async function generateFiles(): Promise<File[]> {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel.texto);
    const files: File[] = [];

    for (let i = 0; i < chunks.length; i++) {
      setRenderText(chunks[i]);
      await waitForNextPaint();

      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: window.devicePixelRatio || 1,
        cacheBust: true,
        skipFonts: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      files.push(
        new File([blob], `evangelho-${i + 1}.png`, {
          type: "image/png",
        })
      );
    }

    return files;
  }

  /*
    Lógica de compartilhamento:
    1) tenta navigator.share({ files }) — se for possível
    2) se falhar, tenta navigator.share({ title, text, url }) — abre share sheet com texto/url
    3) se também falhar, mostra alert final
    Observação: não geramos links nem baixamos automaticamente.
  */
  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const files = await generateFiles();
      if (!files.length) throw new Error("Não foi possível gerar as imagens.");

      // DEBUG helper (descomente se quiser ver no console):
      // console.log("navigator.share:", typeof navigator.share);
      // console.log("navigator.canShare:", typeof (navigator as any).canShare);
      // console.log("files length:", files.length);

      // O comportamento esperado: se navigator.canShare existe, verifica; se não existir, tentamos de qualquer forma.
      const canCheck = typeof (navigator as any).canShare === "function";
      const canShareFiles = canCheck ? (navigator as any).canShare({ files }) : true;

      // Se não há suporte ao navigator.share global — pára e tenta fallback de texto logo abaixo
      if (typeof navigator.share === "function" && canShareFiles) {
        try {
          await navigator.share({
            files,
            title: "Evangelho do Dia",
          });
          onClose();
          return;
        } catch (err: any) {
          // Se o usuário cancelou, sai silenciosamente
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Se falhou (ex.: webview que aceita share mas não files), caímos para tentar o share de texto abaixo
          console.warn("navigator.share(files) falhou — tentando fallback de texto/url", err);
        }
      } else if (typeof navigator.share === "function" && !canCheck) {
        // Caso canShare não exista (muitos navegadores implementam share mas não canShare),
        // fazemos a tentativa na prática: alguns navegadores aceitam files mesmo sem canShare.
        try {
          await navigator.share({
            files,
            title: "Evangelho do Dia",
          });
          onClose();
          return;
        } catch (err: any) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          console.warn("Tentativa sem canShare falhou — fallback de texto/url", err);
        }
      }

      // Fallback: tentar compartilhar texto/url — isso costuma abrir o sheet mesmo quando files não são suportados
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Evangelho do Dia",
            text: "Evangelho do Dia",
            url: window.location.href,
          });
          onClose();
          return;
        } catch (err) {
          // se falhar, vamos para alert abaixo
          console.warn("navigator.share(text) também falhou:", err);
        }
      }

      // Se chegou aqui, nenhum share funcionou
      alert("Seu navegador não suporta compartilhar imagens neste contexto.");
    } catch (err) {
      console.error("Erro geral no fluxo de compartilhamento:", err);
      alert("Não foi possível compartilhar o evangelho agora.");
    } finally {
      setRenderText(previewText);
      setIsSharing(false);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-composer-close" onClick={onClose}>
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
              helperText="Escolha um template ou imagem."
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
              fileInputId="gospel-background-file"
            />

            <div className="share-composer-actions">
              <button
                className="share-composer-button share-composer-button--secondary"
                onClick={onClose}
              >
                Fechar
              </button>

              <button
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

        <div className="hidden-capture-root" aria-hidden="true">
          <GospelShareImage
            ref={captureRef}
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
