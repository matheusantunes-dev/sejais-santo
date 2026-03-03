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
      email: "Fredjoaquimsocial@gmail.com",
      linkedin: "https://www.linkedin.com/in/fredjoaquim/",
      instagram: "https://www.instagram.com/fredjoaquim/",
      phones: ["(38) 9121-6266"],
    },
  ];

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <button
              className="footer-title-button"
              onClick={() => setIsSobreOpen(true)}
            >
              Sobre
            </button>

            <p className="footer-description">
              Conheça mais sobre nossos serviços, valores e missão.
            </p>
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
            <h3 className="footer-title">Desenvolvido por</h3>

            <div className="developers">
              {developers.map((dev) => (
                <div key={dev.name} className="developer-card">
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
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {currentYear} Sejais Santo. Todos os direitos reservados.
        </div>
      </footer>

      <SobreModal
        isOpen={isSobreOpen}
        onClose={() => setIsSobreOpen(false)}
      />
    </>
  );
}
