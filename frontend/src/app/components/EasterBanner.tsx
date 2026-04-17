import "./EasterBanner.css";
import  cristoEucaristicoImage from "@/assets/cristo m.webp";

export function EasterBanner() {
  return (
    <div className="easter-banner">
      {/* Background texture */}
      <div className="easter-background-pattern" />

      <div className="easter-container">
        <div className="easter-content">
          {/* Texto */}
          <div className="easter-text-wrapper">
            <h2 className="easter-title">Os Quatro Pilares da Santidade</h2>

            <ul className="easter-subtitle">
              <li>Determinação</li>
              <li>Oração</li>
              <li>Sacramentos</li>
              <li>Missão</li>
            </ul>
          </div>

          {/* Santíssimo Sacramento */}
          <div className="easter-img-wrapper">
            <img
              src={cristoEucaristicoImage}
              alt="Cristo Eucarístico"
              className="easter-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
