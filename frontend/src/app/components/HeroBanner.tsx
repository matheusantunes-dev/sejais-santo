import carloAcutisImage from "@/assets/Carlos Acutis.webp";
import './HeroBanner.css';

export function HeroBanner() {
  return (
    <section className="hero-banner" id="inicio">
      {/* Background texture */}
      <div
        className="hero-background-texture"
        style={{
          backgroundImage: `url(${carloAcutisImage})`,
        }}
        aria-hidden="true"
      />
      
      <div className="hero-container">
        <div className="hero-content">
          {/* Imagem */}
          <div className="hero-image-wrapper">
            <div className="hero-image-container">
              <img
                src={carloAcutisImage}
                alt="São Carlo Acutis"
                className="hero-image"
                fetchpriority="high"
              />
            </div>
          </div>
          
          {/* Texto */}
          <div className="hero-text-wrapper">
            <h2 className="hero-title">
              Venha Evangelizar
            </h2>
            <div className="hero-subtitle-container">
              <p className="hero-subtitle">
                como São Carlo Acutis!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
