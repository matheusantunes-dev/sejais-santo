"use client";

import { useEffect } from "react";
import { Share2 } from "lucide-react";
import "./VersododiaModal.css";

interface VerseOfDayModalProps {
  open: boolean;
  onClose: () => void;
  iframeUrl: string;
}

export function VersododiaModal({
  open,
  onClose,
  iframeUrl,
}: VerseOfDayModalProps) {

  // 🔒 Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  const handleShare = async () => {
    const shareUrl = iframeUrl;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Versículo do Dia",
          text: "Confira o versículo do dia!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiado para a área de transferência!");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* botão de compartilhar */}
        <button className="modal-share" onClick={handleShare}>
          <Share2 size={18} />
        </button>

        <iframe
          src={iframeUrl}
          title="Versículo do Dia"
          className="verse-iframe"
        />
      </div>
    </div>
  );
}
