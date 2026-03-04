import { useState } from "react";

import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import { GospelCard } from "./components/GospelCard";
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
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showGospel, setShowGospel] = useState(false); // novo estado para abrir evangelho

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
              {/* agora abre o evangelho em modal (ao invés de chamar handleShare) */}
              <FeatureCard
                title="Evangelho do Dia"
                type="gospel"
                onShare={() => setShowGospel(true)}
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

            {/* Card novo para gerar imagem do versículo + compartilhar */}
            <DailyVerseCard />
          </div>
        </main>

        {/* Modal do Organizador */}
        {showOrganizer && (
          <div className="organizer-overlay">
            <div className="organizer-modal">
              <div className="organizer-modal-header">
                <h2>Organizador de Versículos</h2>
                <button className="organizer-close" onClick={() => setShowOrganizer(false)}>
                  ✕
                </button>
              </div>

              <VerseOrganizer />
            </div>
          </div>
        )}

        {/* Modal do Versículo do Dia (se você já tinha VersododiaModal, mantenha) */}
        {showVerseModal && (
          <div className="verso-modal-overlay">
            <div className="verso-modal">
              <button onClick={() => setShowVerseModal(false)}>Fechar</button>
              {/* Se quiser, renderize conteúdo dinâmico aqui */}
              <p>Conteúdo do versículo em modal (ou usar VersododiaModal componente).</p>
            </div>
          </div>
        )}

        {/* Modal do Evangelho (usa GospelCard) */}
        {showGospel && (
          <div className="gospel-overlay">
            <div className="gospel-modal">
              <div className="gospel-modal-header">
                <h2>Evangelho do Dia</h2>
                <button onClick={() => setShowGospel(false)}>✕</button>
              </div>

              <GospelCard />
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
