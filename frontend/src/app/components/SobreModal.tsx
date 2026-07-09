import { Modal } from "./ui/Modal";
import "./SobreModal.css";

interface SobreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SobreModal({ isOpen, onClose }: SobreModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="sobre-modal-content"
      labelledBy="sobre-modal-title"
    >
      <button className="modal-close" onClick={onClose} aria-label="Fechar modal Sobre o Projeto">
        ✕
      </button>

      <h2 id="sobre-modal-title">Sobre o Projeto</h2>

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
    </Modal>
  );
}
