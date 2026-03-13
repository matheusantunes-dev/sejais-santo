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

interface GeneratedImageLink {
  name: string;
  url: string;
}

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
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

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length ? chunks : [text.trim()];
}

export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[1];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageLink[]>([]);

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

  useEffect(() => {
    return () => {
      generatedImages.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [generatedImages]);

  if (!open || !gospel || typeof document === "undefined") return null;

  function replaceGeneratedImages(files: File[]) {
    setGeneratedImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.url));
      return files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));
    });
  }

  function clearGeneratedImages() {
    setGeneratedImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.url));
      return [];
    });
  }

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
      console.error(error);
      alert("Nao foi possivel carregar a imagem escolhida.");
    } finally {
      event.target.value = "";
    }
  }

  async function generateFiles() {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel.texto);
    const files: File[] = [];

    for (let index = 0; index < chunks.length; index += 1) {
      setRenderText(chunks[index]);
      await waitForNextPaint();

      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: window.devicePixelRatio || 1,
        skipFonts: true,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      files.push(
        new File([blob], `evangelho-${index + 1}.png`, {
          type: "image/png",
        }),
      );
    }

    return files;
  }

  async function handleShare() {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const files = await generateFiles();

      if (!files.length) {
        throw new Error("Nao foi possivel gerar as imagens.");
      }

      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" || navigator.canShare({ files }));

      if (canShareFiles) {
        try {
          await navigator.share({
            files,
            title: "Evangelho do Dia",
          });
          clearGeneratedImages();
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          console.warn("Compartilhamento indisponivel. Mostrando imagens para abrir manualmente.", error);
        }
      }

      replaceGeneratedImages(files);
    } catch (error) {
      console.error("Erro ao gerar imagens:", error);
      alert("Nao foi possivel compartilhar o evangelho agora.");
    } finally {
      setRenderText(previewText);
      setIsSharing(false);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="share-composer-close" onClick={onClose}>
          x
        </button>

        <div className="share-composer-header">
          <h3>Compartilhar Evangelho</h3>
          <p>
            Escolha um dos 5 templates ou use uma imagem da galeria do celular. O compartilhamento
            continua dividindo o evangelho em 2 ou mais imagens quando o texto for grande.
          </p>
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
              helperText="Escolha um template pronto ou uma imagem da galeria sem alterar o formato original do evangelho."
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
              fileInputId="gospel-background-file"
            />

            <p className="share-composer-note">
              Se o navegador nao suportar compartilhamento direto, exibimos os links das imagens para voce
              abrir manualmente, sem popup bloqueado e sem download automatico.
            </p>

            {generatedImages.length > 0 && (
              <div className="share-composer-generated" role="status" aria-live="polite">
                <strong>Imagens prontas:</strong>
                <ul>
                  {generatedImages.map((image) => (
                    <li key={image.url}>
                      <a href={image.url} target="_blank" rel="noreferrer">
                        Abrir {image.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="share-composer-button share-composer-button--secondary"
                  onClick={clearGeneratedImages}
                >
                  Limpar links
                </button>
              </div>
            )}

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
