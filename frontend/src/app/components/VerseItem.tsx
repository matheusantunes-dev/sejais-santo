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
  onDelete?: () => void;
}) {
  const scheduledLabel = verse.scheduledAt
    ? new Date(verse.scheduledAt).toLocaleString()
    : null;

  function handleShare() {
    if (!canShare) return;
    void onShare();
  }

  return (
    <div className="vi-root">
      <div className="vi-main">
        {verse.note && <div className="vi-author">{verse.note}</div>}

        <div className="vi-text">{verse.text}</div>

        {scheduledLabel && (
          <div className="vi-scheduled">
            Lembre-se de agendar no seu calendario! Agendado para: {scheduledLabel}
          </div>
        )}
      </div>

      <div className="vi-actions">
        <button className="vi-share" onClick={handleShare} disabled={!canShare}>
          Compartilhar
        </button>
      </div>
    </div>
  );
}
