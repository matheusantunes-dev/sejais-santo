// src/app/components/VerseItem.tsx
import React from "react";
import "./VerseItem.css";

type Verse = {
  id: string;
  text: string;
  author?: string | null;
  scheduledAt?: string | null;
  ownerEmail?: string | null;
};

export default function VerseItem({
  verse,
  onShare,
  canShare,
}: {
  verse: Verse;
  onShare: () => void;
  canShare: boolean;
}) {
  // formata data amigável (se existir scheduledAt)
  const scheduledLabel = verse.scheduledAt ? new Date(verse.scheduledAt).toLocaleString() : null;

  return (
    <div className="vi-root">
      <div className="vi-main">
        <div className="vi-text">{verse.text}</div>
        {verse.author && <div className="vi-author">{verse.author}</div>}
        {scheduledLabel && <div className="vi-scheduled">Agendado para: {scheduledLabel}</div>}
      </div>

      <div className="vi-actions">
        <button
          className="vi-share"
          onClick={() => {
            // confirm modal simples
            if (!confirm("Compartilhar este versículo? Ele será removido da sua lista.")) return;
            onShare();
          }}
          disabled={!canShare}
          title={canShare ? "Compartilhar (remover da lista)" : "Faça login para compartilhar"}
        >
          Compartilhar
        </button>
      </div>
    </div>
  );
}
