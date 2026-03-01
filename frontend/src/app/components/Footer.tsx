import React, { useState } from "react";
import "./Footer.css";
import { SobreModal } from "./SobreModal";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSobreOpen, setIsSobreOpen] = useState(false);

  const developers = [
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
        <div className="footer-content">
          <div className="footer-section">
            <button
              className="footer-title-button"
              onClick={() => setIsSobreOpen(true)}
            >
              Sobre
            </button>
            <p>Conheça mais sobre nossos serviços e valores.</p>
          </div>

          <div className="footer-section">
            <h3>Contato</h3>
            <p>Email: matheusantunesreis6@gmail.com</p>
            <p>Email: Fredjoaquimsocial@gmail.com</p>
          </div>

          <div className="footer-section">
            <h3>Desenvolvido por</h3>

            {developers.map((dev) => (
              <div key={dev.name} className="developer-card">
                <p className="dev-name">{dev.name}</p>

                <p>
                  Email: <a href={`mailto:${dev.email}`}>{dev.email}</a>
                </p>

                <p>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </p>

                <p>
                  <a
                    href={dev.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </p>

                <div className="dev-phones">
                  {dev.phones.map((phone, index) => (
                    <p key={index}>
                      <a href={`tel:${phone}`}>{phone}</a>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} Sejais Santo - Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <SobreModal isOpen={isSobreOpen} onClose={() => setIsSobreOpen(false)} />
    </>
  );
}
