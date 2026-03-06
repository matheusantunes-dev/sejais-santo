import carloAcutisImage from '@/assets/Carlos Acutis.png';
import './HeroBanner.css';

export function HeroBanner() {
  return (
    <div className="hero-banner">
      {/* Background texture */}
      <div 
        className="hero-background-texture"
        style={{
          backgroundImage: `url(${carloAcutisImage})`,
        }}
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
    </div>
  );
}
