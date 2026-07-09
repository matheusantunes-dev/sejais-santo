import { useState } from "react";
import { toast } from "sonner";

import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/FeatureCard";
import VerseOrganizer from "./components/VerseOrganizer";
import { EasterBanner } from "./components/EasterBanner";
import { AboutSection } from "./components/AboutSection";
import { LiturgicalFooter } from "./components/LiturgicalFooter";
import { Footer } from "./components/Footer";
import { BottomNav } from "./components/BottomNav";
import { BackToTop } from "./components/BackToTop";
import { VersododiaModal } from "./components/VersododiaModal";
import { LiturgicalThemeManager } from "./LiturgicalThemeManager";
import { Toaster } from "./components/ui/sonner";
import { BibleNavigation } from "./components/BibleNavigation";
import { BibleSearch } from "./components/BibleSearch";
import { SaintsWidget } from "./components/SaintsWidget";
import { Container } from "./components/ui/Container";
import { isEnabled } from "@/config/features";
import { useGospel } from "./services/useGospel";

import "./App.css";

export default function App() {
  const gospelState = useGospel();
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showBibleNav, setShowBibleNav] = useState(false);

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
      toast.error("Compartilhamento não disponível neste navegador");
    }
  };

  return (
    <>
      <LiturgicalThemeManager />
      <Toaster />

      <div className="app-container">
        <Header />

        <HeroBanner />

        <main className="main-content">
          <section id="evangelho">
            <Container size="xl" className="content-wrapper-pad">
            <div className="cards-grid">
              <FeatureCard
                title="Evangelho do Dia"
                type="gospel"
                onShare={() => handleShare("Evangelho do Dia")}
                gospel={gospelState.gospel}
                liturgical={gospelState.liturgical}
                loading={gospelState.loading}
                error={gospelState.error}
              />

              <FeatureCard
                title="Bíblia"
                description="Navegue pelos livros da Bíblia"
                type="verses"
                onShare={() => {
                  if (isEnabled("BIBLE_NAVIGATION")) {
                    setShowBibleNav(true);
                  } else {
                    setShowVerseModal(true);
                  }
                }}
              />

              <section id="organizador">
                <FeatureCard
                  title="Organize Seus Versículos"
                  description="Crie e organize seus versículos favoritos."
                  type="organize"
                  onShare={() => handleShare("Organize Seus Versículos")}
                  onEdit={() => setShowOrganizer(true)}
                />
              </section>
            </div>

            <section id="santos">
              <SaintsWidget />
            </section>
          </Container>
          </section>
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

        {showBibleNav && (
          <div className="organizer-overlay" onClick={() => setShowBibleNav(false)}>
            <div className="organizer-modal" onClick={(e) => e.stopPropagation()}>
              <div className="organizer-modal-header">
                <h2>Bíblia</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowBibleNav(false)}
                >
                  ✕
                </button>
              </div>
              <BibleSearch onNavigate={(slug, chapter) => {
                console.log("Navegar para", slug, chapter);
              }} />
              <BibleNavigation />
            </div>
          </div>
        )}

        <EasterBanner />

        <AboutSection />

        <LiturgicalFooter />

        <Footer />
      </div>

      <BottomNav />
      <BackToTop />
    </>
  );
}
