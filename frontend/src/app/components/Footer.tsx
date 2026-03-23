import React, { useState } from "react";
import "./Footer.css";
import { SobreModal } from "./SobreModal";

type Developer = {
  name: string;
  email: string;
  linkedin: string;
  instagram: string;
  phones: string[];
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSobreOpen, setIsSobreOpen] = useState(false);

  const developers: Developer[] = [
    {
      name: "Matheus Antunes",
      email: "matheusantunesreis6@gmail.com",
      linkedin: "https://www.linkedin.com/in/matheusantunes-dev",
      instagram: "https://www.instagram.com/matheusantunesreis/",
      phones: ["(38) 98806-4942"],
    },
    {
      name: "Fred Joaquim",
      email: "Fredjoaquimprogramador@gmail.com",
      linkedin: "https://www.linkedin.com/in/fredjoaquim/",
      instagram: "https://www.instagram.com/fredjoaquim/",
      phones: ["(38) 9121-6266"],
    },
  ];

  return (
    <>
      <footer className="footer" role="contentinfo">
        <div className="footer-glow footer-glow-left" aria-hidden="true" />
        <div className="footer-glow footer-glow-right" aria-hidden="true" />

        <div className="footer-container">
          <div className="footer-brand-column">
            <p className="footer-kicker">Sejais Santo</p>
            <h2 className="footer-brand-title">Uma plataforma para viver a fé no dia a dia.</h2>
            <p className="footer-description">
              Reflexões, liturgia e recursos católicos para acompanhar sua caminhada espiritual com simplicidade.
            </p>

            <button
              className="footer-about-button"
              onClick={() => setIsSobreOpen(true)}
            >
              Conheça o projeto
            </button>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Contato</h3>

            <div className="footer-links">
              <a href="mailto:matheusantunesreis6@gmail.com">
                matheusantunesreis6@gmail.com
              </a>
              <a href="mailto:Fredjoaquimsocial@gmail.com">
                Fredjoaquimsocial@gmail.com
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Equipe de desenvolvimento</h3>

            <div className="developers-grid">
              {developers.map((dev) => (
                <article key={dev.name} className="developer-card">
                  <strong className="dev-name">{dev.name}</strong>

                  <div className="dev-links">
                    <a href={`mailto:${dev.email}`}>Email</a>

                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>

                    <a
                      href={dev.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  </div>

                  <div className="dev-phones">
                    {dev.phones.map((phone, index) => (
                      <a key={index} href={`tel:${phone}`}>
                        {phone}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} Sejais Santo.</span>
          <span>Todos os direitos reservados.</span>
        </div>
      </footer>

      <SobreModal
        isOpen={isSobreOpen}
        onClose={() => setIsSobreOpen(false)}
      />
    </>
  );
}
