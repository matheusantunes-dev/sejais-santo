import { useState } from "react";

import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import VerseOrganizer from "./components/VerseOrganizer";
import { EasterBanner } from "./components/EasterBanner";
import { AboutSection } from "./components/AboutSection";
import { LiturgicalFooter } from "./components/LiturgicalFooter";
import { Footer } from "./components/Footer";
import { LiturgicalThemeManager } from "./LiturgicalThemeManager";
import DailyVerseCard from "./components/DailyVerseCard";

import "./App.css";

export default function App() {
  const [showOrganizer, setShowOrganizer] = useState(false);

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
                title="Versículo do Dia"
                description="Compartilhe o versículo como imagem"
                type="verses"
                onShare={() => handleShare("Versículo do Dia")}
              />

              <FeatureCard
                title="Organize Seus Versículos"
                description="Crie e organize seus versículos favoritos."
                type="organize"
                onShare={() => handleShare("Organize Seus Versículos")}
                onEdit={() => setShowOrganizer(true)}
              />
            </div>

            <DailyVerseCard />
          </div>
        </main>

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

        <EasterBanner />

        <AboutSection />

        <LiturgicalFooter />

        <Footer />
      </div>
    </>
  );
}
