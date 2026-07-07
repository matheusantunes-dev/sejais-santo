import { ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import carloAcutisImage from "@/assets/Carlos Acutis sobre.webp";
import "./AboutSection.css";

export function AboutSection() {
  return (
    <section className="about-section" id="sobre">
      <Container size="xl">
        <div className="about-title-wrapper">
          <div className="about-title-container">
            <div className="about-title-line" aria-hidden="true" />
            <h2 className="about-title">Quem Foi São Carlo Acutis?</h2>
            <div className="about-title-line" aria-hidden="true" />
          </div>
        </div>

        <div className="about-card">
          <div className="about-content">
            <div className="about-image-wrapper">
              <div className="about-image-container">
                <div className="about-image-background" aria-hidden="true" />
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
              <Button
                as="a"
                href="https://www.vaticannews.va/pt/papa/news/2025-09/papa-leao-xiv-missa-canonizacao-biografia-acutis.html"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Saiba mais sobre São Carlo Acutis (abre em nova janela)"
                endIcon={ChevronRight}
                size="lg"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
