import { useState } from "react";

import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import VerseOrganizer from "./components/VerseOrganizer";
import { EasterBanner } from "./components/EasterBanner";
import { AboutSection } from "./components/AboutSection";
import { LiturgicalFooter } from "./components/LiturgicalFooter";
import { Footer } from "./components/Footer";
import { VersododiaModal } from "./components/VersododiaModal";
import { LiturgicalThemeManager } from "./LiturgicalThemeManager";
import VerseShare from "./components/VerseShare";

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
                title="Versículos do Dia"
                description="Leitura para o Dia"
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

        {/* ORGANIZADOR */}
        {showOrganizer && (
          <div className="organizer-overlay">
            <div className="organizer-modal">
              <div className="organizer-modal-header">
                <h2>Organizador de Versículos</h2>

                <button
                  className="organizer-close"
                  onClick={() => setShowOrganizer(false)}
                >
                  ✕
                </button>
              </div>

              <VerseOrganizer />
            </div>
          </div>
        )}

        {/* MODAL DO VERSÍCULO */}
        {showVerseModal && (
          <VersododiaModal
            open={showVerseModal}
            onClose={() => setShowVerseModal(false)}
          >
            <VerseShare />
          </VersododiaModal>
        )}

        <EasterBanner />

        <AboutSection />

        <LiturgicalFooter />

        <Footer />

      </div>
    </>
  );
}
