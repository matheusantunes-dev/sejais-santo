import { ChangeEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { ShareSquareCard } from "./ShareSquareCard";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { verseShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, shareFilesOrDownload } from "../share/shareUtils";
import "./ShareComposer.css";

interface VerseImageShareModalProps {
  open: boolean;
  onClose: () => void;
  modalTitle: string;
  helperText: string;
  cardLabel: string;
  text: string;
  reference?: string;
  footerLabel?: string;
  fileName: string;
  shareTitle: string;
  loading?: boolean;
}

export function VerseImageShareModal({
  open,
  onClose,
  modalTitle,
  helperText,
  cardLabel,
  text,
  reference,
  footerLabel,
  fileName,
  shareTitle,
  loading = false,
}: VerseImageShareModalProps) {
  const defaultTemplate = verseShareTemplates[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [captureRef, setCaptureRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    setSelectedTemplateId(defaultTemplate.id);
    setBackgroundSrc(defaultTemplate.src);
    setCustomFileName("");
  }, [defaultTemplate.id, defaultTemplate.src, open]);

  if (!open || typeof document === "undefined") return null;

  const previewText = text || (loading ? "Carregando versiculo..." : "Versiculo indisponivel no momento.");
  const canShare = !loading && Boolean(text.trim()) && !isSharing && Boolean(captureRef);

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

  async function handleShare() {
    if (!captureRef || !canShare) return;

    setIsSharing(true);

    try {
      const blob = await toBlob(captureRef, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) {
        throw new Error("Nao foi possivel gerar a imagem do versiculo.");
      }

      const file = new File([blob], fileName, { type: "image/png" });
      await shareFilesOrDownload({ files: [file], title: shareTitle });
    } catch (error) {
      console.error(error);
      alert("Nao foi possivel compartilhar o versiculo agora.");
    } finally {
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
          <h3>{modalTitle}</h3>
          <p>{helperText}</p>
        </div>

        <div className="share-composer-layout">
          <div className="share-composer-preview">
            <ShareSquareCard
              headerLabel={cardLabel}
              text={previewText}
              reference={reference}
              footerLabel={footerLabel}
              backgroundSrc={backgroundSrc}
              width={308}
              height={308}
            />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading="Fundos prontos para versiculo"
              helperText="Escolha um dos 5 templates com paisagens e biblia aberta ou use uma foto da galeria."
              templates={verseShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
              fileInputId={`${fileName}-background-file`}
            />

            <p className="share-composer-note">
              O compartilhamento gera uma imagem quadrada pronta para story, status ou envio direto.
            </p>

            <div className="share-composer-actions">
              <button type="button" className="share-composer-button share-composer-button--secondary" onClick={onClose}>
                Fechar
              </button>
              <button
                type="button"
                className="share-composer-button share-composer-button--primary"
                onClick={handleShare}
                disabled={!canShare}
              >
                <Share2 size={18} />
                {isSharing ? "Gerando..." : "Compartilhar"}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden-capture-root" aria-hidden="true">
          <ShareSquareCard
            ref={setCaptureRef}
            headerLabel={cardLabel}
            text={previewText}
            reference={reference}
            footerLabel={footerLabel}
            backgroundSrc={backgroundSrc}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
