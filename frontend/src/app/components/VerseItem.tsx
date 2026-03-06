// src/app/components/VerseItem.tsx
import React from "react";
import "./VerseItem.css";

type Verse = {
  id: string;
  text: string;
  note?: string | null;
  scheduledAt?: string | null;
};

export default function VerseItem({
  verse,
  onShare,
  canShare,
}: {
  verse: Verse;
  onShare: () => Promise<void> | void;
  canShare: boolean;
}) {
  const scheduledLabel = verse.scheduledAt
    ? new Date(verse.scheduledAt).toLocaleString()
    : null;

  async function handleShare() {
    if (!canShare) return;

    const author = verse.note || "Autor desconhecido";
    const content = `${author}\n\n${verse.text}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Versículo",
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        alert("Versículo copiado para a área de transferência.");
      }

      // 🔥 Só remove depois de compartilhar
      await onShare();

    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  }

  return (
    <div className="vi-root">
      <div className="vi-main">
        {verse.note && (
          <div className="vi-author">{verse.note}</div>
        )}

        <div className="vi-text">{verse.text}</div>

        {scheduledLabel && (
          <div className="vi-scheduled">
            
            Lembre-se de agendar no seu calendário! Agendado para: {scheduledLabel} 
           
          </div>
        )}
      </div>

      <div className="vi-actions">
        <button
          className="vi-share"
          onClick={handleShare}
          disabled={!canShare}
        >
          Compartilhar
        </button>
      </div>
    </div>
  );
}
