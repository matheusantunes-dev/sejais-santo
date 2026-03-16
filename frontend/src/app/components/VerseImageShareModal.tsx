"use client";

import { useRef } from "react";
import { toBlob } from "html-to-image";
import { shareFiles } from "../share/shareUtils";

interface Props {
  open: boolean;
  onClose: () => void;

  modalTitle: string;
  helperText?: string;
  cardLabel?: string;

  text: string;
  reference: string;

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
  fileName,
  shareTitle,
  loading,
}: Props) {

  const captureRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  async function handleShare() {
    if (!captureRef.current) return;

    try {
      const blob = await toBlob(captureRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) return;

      const file = new File([blob], fileName, {
        type: "image/png",
      });

      await shareFiles({
        files: [file],
        title: shareTitle,
        text: reference,
      });

      onClose();
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  }

  return (
    <div className="verse-share-modal">

      <div className="verse-share-header">
        <h2>{modalTitle}</h2>
        {helperText && <p>{helperText}</p>}
      </div>

      <div
        ref={captureRef}
        className="verse-share-card"
      >

        {cardLabel && (
          <div className="verse-card-label">
            {cardLabel}
          </div>
        )}

        <div className="verse-text">
          {loading ? "Carregando..." : text}
        </div>

        <div className="verse-reference">
          {reference}
        </div>

        <div className="verse-credit">
          SEJAIS SANTO
        </div>

      </div>

      <div className="verse-share-actions">
        <button onClick={onClose}>
          Fechar
        </button>

        <button onClick={handleShare}>
          Compartilhar
        </button>
      </div>

    </div>
  );
}
