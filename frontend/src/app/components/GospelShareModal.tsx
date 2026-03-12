import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, shareFilesOrDownload, waitForNextPaint } from "../share/shareUtils";
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

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

function buildChunks(text: string) {
  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let current = "";
  const maxChars = 900;

  sentences.forEach((sentence) => {
    if ((current + sentence).length > maxChars && current.length > 220) {
      chunks.push(current.trim());
      current = `${sentence} `;
      return;
    }

    current += `${sentence} `;
  });

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length ? chunks : [text];
}

export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
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

      const blob = await toBlob(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) {
        throw new Error("Nao foi possivel gerar a imagem do evangelho.");
      }

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
      await shareFilesOrDownload({ files, title: "Evangelho do Dia" });
    } catch (error) {
      console.error(error);
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
            Escolha um dos 5 templates com folha de biblia ou use uma imagem da galeria do celular
            antes de gerar as artes do evangelho.
          </p>
        </div>

        <div className="share-composer-layout">
          <div className="share-composer-preview is-portrait">
            <GospelShareImage
              referencia={gospel.referencia}
              texto={previewText}
              backgroundSrc={backgroundSrc}
              width={252}
              height={448}
            />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading="Fundos prontos do Evangelho"
              helperText="Todos os 5 templates foram preparados para leitura com textura de pagina biblica."
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
              fileInputId="gospel-background-file"
            />

            <p className="share-composer-note">
              Se o texto do evangelho ficar longo, o app vai gerar varias imagens automaticamente.
            </p>

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
