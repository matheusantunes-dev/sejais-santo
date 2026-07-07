import "./EasterBanner.css";
import  cristoEucaristicoImage from "@/assets/cristo m.webp";

export function EasterBanner() {
  return (
    <section className="easter-banner" id="pilares">
      <div className="easter-background-pattern" aria-hidden="true" />

      <div className="easter-container">
        <div className="easter-content">
          <div className="easter-text-wrapper">
            <h2 className="easter-title">Os Quatro Pilares da Santidade</h2>

            <ul className="easter-subtitle">
              <li>Determinação</li>
              <li>Oração</li>
              <li>Sacramentos</li>
              <li>Missão</li>
            </ul>
          </div>

          <div className="easter-img-wrapper">
            <img
              src={cristoEucaristicoImage}
              alt="Cristo Eucarístico"
              className="easter-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
