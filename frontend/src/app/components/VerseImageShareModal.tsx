// src/components/VerseImageShareModal.tsx

import React, { useRef } from "react";
import { toBlob } from "html-to-image";
import { shareFiles } from "../share/shareUtils";

type Props = {
  onClose: () => void;
  shareTitle?: string;
};

export function VerseImageShareModal({ onClose, shareTitle = "Evangelho" }: Props) {
  const captureRef = useRef<HTMLDivElement | null>(null);

  async function handleShareClick() {
    if (!captureRef.current) {
      console.error("[VerseShare] captureRef not found");
      return;
    }

    try {
      const blob = await toBlob(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
      });

      if (!blob) {
        console.error("Erro ao gerar imagem");
        return;
      }

      const fileName = `${shareTitle.replace(/\s+/g, "-").toLowerCase()}.png`;

      const file = new File([blob], fileName, {
        type: "image/png",
      });

      await shareFiles({
        files: [file],
        title: shareTitle,
        text: shareTitle,
      });

      onClose();
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  }

  return (
    <div className="verse-share-modal">
      <div ref={captureRef} id="verse-capture" style={{ padding: 16 }}>
        <h2>{shareTitle}</h2>
        <p>Texto do evangelho — substitua com seu conteúdo dinâmico</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleShareClick}>
          Compartilhar
        </button>

        <button onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
