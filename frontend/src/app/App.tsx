import { useState } from "react";

import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import { GospelCard } from "./components/GospelCard";
import VerseOrganizer from "./components/VerseOrganizer";
import { VerseOrganizerIcon } from "./components/VerseOrganizerIcon";
import { EasterBanner } from "./components/EasterBanner";
import { AboutSection } from "./components/AboutSection";
import { LiturgicalFooter } from "./components/LiturgicalFooter";
import { Footer } from "./components/Footer";
import { VersododiaModal } from "./components/VersododiaModal";
import { LiturgicalThemeManager } from "./LiturgicalThemeManager";

import "./App.css";

export default function App() {
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);

  const handleShare = (feature: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: `Sejais Santo - ${feature}`,
          text: "Confira este conteúdo do Sejais Santo!",
          url: window.location.href,
        })
        .catch((err) => console.log("Erro ao compartilhar:", err));
    } else {
      alert("Função de compartilhamento não disponível neste navegador");
    }
  };

  return (
    <>
      <LiturgicalThemeManager />

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="velvet-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.5
              0 0 0 0 0.5
              0 0 0 0 0.5
              0 0 0 -0.4 1
            "
          />
        </filter>
      </svg>

      <div className="app-container">
        <Header />

        <HeroBanner />

        <main className="main-content">
          <div className="content-wrapper">
            <div className="cards-grid">
              <FeatureCard
                title="Evangelho do Dia"
                type="gospel"
                onShare={() => handleShare("Evangelho do Dia")}
              />

              <FeatureCard
                title="Versículos para leitura"
                description="Leitura diária"
                type="verses"
                onShare={() => setShowVerseModal(true)}
              />

              <FeatureCard
                title="Organize Seus Versículos"
                description="Crie e organize seus versículos favoritos."
                type="organize"
                onShare={() => handleShare("Organize Seus Versículos")}
                onEdit={() => setShowOrganizer(true)}
              />
            </div>
          </div>
        </main>

        {showOrganizer && (
          <div className="organizer-overlay">
            <div className="organizer-modal">
              <div className="organizer-modal-header">
                <h2>Organizador de Versículos</h2>

                <button
                  className="modal-close"
                  onClick={() => setShowOrganizer(false)}
                >
                  ✕
                </button>
              </div>

              <VerseOrganizer />
            </div>
          </div>
        )}

        {showVerseModal && (
          <VersododiaModal
            open={showVerseModal}
            onClose={() => setShowVerseModal(false)}
          />
        )}

        <EasterBanner />

        <AboutSection />

        <LiturgicalFooter />

        <Footer />
      </div>
    </>
  );
}
