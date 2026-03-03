import { ChevronRight } from "lucide-react";
import carloAcutisImage from "@/assets/Carlos Acutis sobre.png";
import "./AboutSection.css";

export function AboutSection() {
  return (
    <div className="about-section">
      <div className="about-container">
        {/* Title */}
        <div className="about-title-wrapper">
          <div className="about-title-container">
            <div className="about-title-line" />
            <h2 className="about-title">Quem Foi São Carlo Acutis?</h2>
            <div className="about-title-line" />
          </div>
        </div>

        {/* Content Card */}
        <div className="about-card">
          <div className="about-content">
            {/* Image with background */}
            <div className="about-image-wrapper">
              <div className="about-image-container">
                {/* Background effect */}
                <div className="about-image-background" />
                <div className="about-image-frame">
                  <img
                    src={carloAcutisImage}
                    alt="São Carlo Acutis"
                    className="about-image"
                  />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="about-text-wrapper">
              <h3 className="about-subtitle">
                O Jovem da Internet e da Eucaristia
              </h3>
              <p className="about-description">
                Carlo Acutis foi um jovem italiano católico, conhecido como o
                "santo da internet", que usou suas habilidades em computação
                para evangelizar, criando um site sobre milagres eucarísticos
                antes de falecer de leucemia aos 15 anos em 2006, sendo
                canonizado em 2025 como o primeiro santo da geração "millennial"
                por unir fé e tecnologia, inspirando jovens com sua devoção e
                simplicidade.
              </p>
              <a href="https://site-externo.com" target="_blank" rel="noopener noreferrer" className="about-button-link">
                 <button className="about-button">
                              Saiba Mais
                          <ChevronRight className="about-button-icon" />
                 </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
