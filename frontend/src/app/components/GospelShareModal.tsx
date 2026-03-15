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
    } catch {
      alert("Não foi possível carregar a imagem.");
    }
  }

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

  async function handleShare() {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const files = await generateFiles();

      if (!files.length) throw new Error("Erro ao gerar imagens");

      const canShareFiles =
        navigator.canShare && navigator.canShare({ files });

      if (!navigator.share || !canShareFiles) {
        throw new Error("Compartilhamento de arquivos não suportado");
      }

      await navigator.share({
        files,
        title: "Evangelho do Dia",
      });

      onClose();
    } catch (error) {
      console.error(error);

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Evangelho do Dia",
            text: "Evangelho do Dia",
            url: window.location.href,
          });

          onClose();
          return;
        } catch {}
      }

      alert("Seu navegador não suporta compartilhar imagens.");
    } finally {
      setRenderText(previewText);
      setIsSharing(false);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div
        className="share-composer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="share-composer-close"
          onClick={onClose}
        >
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
