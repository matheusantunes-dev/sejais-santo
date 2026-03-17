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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="share-composer-close" onClick={onClose}>
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
          &emsp;A iniciativa nasce da convicção de que a tecnologia pode ser um
          instrumento de evangelização. Utilizando a web como meio de
          comunicação e formação, o projeto procura aproximar fé e tecnologia,
          tornando conteúdos católicos mais organizados, acessíveis e presentes
          na rotina das pessoas.
        </p>

        <p>
          &emsp;O projeto é desenvolvido por Matheus Antunes e Fred Joaquim,
          unindo dedicação técnica, boas práticas de desenvolvimento e um
          propósito maior: colocar o conhecimento tecnológico a serviço da
          evangelização.
        </p>
      </div>
    </div>
  );
}
