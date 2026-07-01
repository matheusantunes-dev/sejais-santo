import React, { useEffect, useRef } from "react";
import "./SobreModal.css";

interface SobreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SobreModal({ isOpen, onClose }: SobreModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const prevFocus = document.activeElement as HTMLElement | null;
    const focusable = contentRef.current.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    focusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      prevFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sobre o Projeto">
      <div className="modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
        <button className="share-composer-close" onClick={onClose} aria-label="Fechar modal Sobre o Projeto">
          ✕
        </button>

        <h2>Sobre o Projeto</h2>

        <p>
          O Sejais Santo é uma plataforma criada com o propósito de ajudar as
          pessoas a viver a fé católica no dia a dia. Por meio de reflexões,
          conteúdos espirituais e recursos voltados à formação cristã, o projeto
          busca oferecer um espaço simples e acessível para quem deseja
          aprofundar sua caminhada com Deus.
        </p>
        <p>
          A iniciativa nasce da convicção de que a tecnologia pode ser um
          instrumento de evangelização. Utilizando a web como meio de
          comunicação e formação, o projeto procura aproximar fé e tecnologia,
          tornando conteúdos católicos mais organizados, acessíveis e presentes
          na rotina das pessoas.
        </p>

        <p>
          O projeto é desenvolvido por Matheus Antunes e Fred Joaquim,
          unindo dedicação técnica, boas práticas de desenvolvimento e um
          propósito maior: colocar o conhecimento tecnológico a serviço da
          evangelização.
        </p>
      </div>
    </div>
  );
}
