import React from "react";
import "./SobreModal.css";

interface SobreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SobreModal({ isOpen, onClose }: SobreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Sobre o Projeto Sejais Santo</h2>

        <p>
          O projeto Sejais Santo nasce com a missão de evangelizar
          através da tecnologia, utilizando a web como instrumento
          para compartilhar fé, reflexão e formação católica.
        </p>

        <p>
          Desenvolvido por Matheus Antunes e Fred Joaquim,
          buscamos unir organização de código, boas práticas
          e propósito espiritual.
        </p>
      </div>
    </div>
  );
}