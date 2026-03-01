"use client";

import { useEffect } from "react";
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

  // 🔒 Bloqueia o scroll do body enquanto o modal estiver aberto
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

  // 🚫 Não renderiza nada se o modal estiver fechado
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // evita fechar quando clica dentro
      >
        <button className="modal-close" onClick={onClose}>
          ✕
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