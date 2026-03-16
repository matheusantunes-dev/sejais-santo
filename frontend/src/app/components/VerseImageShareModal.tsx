// src/app/components/VerseImageShareModal.tsx

import React, { useRef } from "react";
import { toBlob } from "html-to-image";
import { shareFiles } from "../share/shareUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  text: string;
  reference: string;
};

export function VerseImageShareModal({
  open,
  onClose,
  text,
  reference,
}: Props) {

  const captureRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  async function handleShareClick() {

    if (!captureRef.current) return;

    try {

      const blob = await toBlob(captureRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) return;

      const file = new File(
        [blob],
        "versiculo-do-dia.png",
        { type: "image/png" }
      );

      await shareFiles({
        files: [file],
        title: "Versículo do Dia",
        text: reference,
      });

      onClose();

    } catch (err) {

      console.error("Erro ao compartilhar:", err);

    }
  }

  return (
    <div className="verse-share-modal">

      <div
        ref={captureRef}
        className="verse-share-image"
      >
        <div className="verse-background" />

        <div className="verse-content">

          <div className="verse-text">
            {text}
          </div>

          <div className="verse-reference">
            {reference}
          </div>

          <div className="verse-credit">
            SEJAIS SANTO
          </div>

        </div>
      </div>

      <div className="verse-share-actions">

        <button onClick={onClose}>
          Fechar
        </button>

        <button onClick={handleShareClick}>
          Compartilhar
        </button>

      </div>

    </div>
  );
}
