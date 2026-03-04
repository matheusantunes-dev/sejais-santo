import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import VerseOrganizer from "./components/VerseOrganizer";
import { EasterBanner } from "./components/EasterBanner";
import { AboutSection } from "./components/AboutSection";
import { LiturgicalFooter } from "./components/LiturgicalFooter";
import { Footer } from "./components/Footer";
import { LiturgicalThemeManager } from "./LiturgicalThemeManager";

import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";

import "./App.css";

export default function App() {
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);

  const shareRef = useRef<HTMLDivElement>(null);

  // carregar script DailyVerses
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://dailyverses.net/get/verse.js?language=nvi";
    script.async = true;
    script.defer = true;

    const container = document.getElementById("dailyVersesContainer");

    if (container && !container.querySelector("script")) {
      container.appendChild(script);
    }
  }, []);

  // gerar imagem
  const handleShareImage = async () => {
    if (!shareRef.current) return;

    try {
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], "versiculo-do-dia.png", {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Versículo do Dia",
        });
      } else {
        alert("Seu navegador não suporta compartilhar imagem.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
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
                onShare={() => {}}
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
                onShare={() => {}}
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

        {showVerseModal && (
          <div className="organizer-overlay">
            <div className="organizer-modal">
              <div className="organizer-modal-header">
                <h2>Versículo do Dia</h2>

                <button
                  className="organizer-close"
                  onClick={() => setShowVerseModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* versículo automático */}
              <div
                id="dailyVersesContainer"
                style={{
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              />

              {/* card que vira imagem */}
              <div
                ref={shareRef}
                style={{
                  width: "1080px",
                  height: "1080px",
                  background: "#f6f1e8",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "80px",
                  textAlign: "center",
                  borderRadius: "20px",
                  fontSize: "36px",
                }}
              >
                <h2>Versículo do Dia</h2>

                <div id="dailyVersesContainer"></div>

                <p style={{ marginTop: "40px", fontSize: "24px" }}>
                  sejaissanto.app
                </p>
              </div>

              <button
                style={{ marginTop: "20px" }}
                onClick={handleShareImage}
              >
                Compartilhar imagem
              </button>
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
