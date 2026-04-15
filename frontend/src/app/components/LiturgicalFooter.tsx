import "./LiturgicalFooter.css";
import adventoImg from "@/assets/advento.png";
import pascalImg from "@/assets/pascal.png";
import quaresmaImg from "@/assets/quaresma.png";
import comumImg from "@/assets/tempo comum.png";
import {
  getLiturgicalSeason,
  LiturgicalSeason,
} from "@/utils/LiturgicalCalendar";
import { useEffect, useState } from "react";

interface LiturgicalFooterProps {
  currentPeriod?: LiturgicalSeason;
}

export function LiturgicalFooter({ currentPeriod }: LiturgicalFooterProps) {
  const [season, setSeason] = useState<LiturgicalSeason>(() =>
    getLiturgicalSeason(new Date())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSeason(getLiturgicalSeason(new Date()));
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const seasonPhrases: Record<LiturgicalSeason, string> = {
    Advento: "Preparai o caminho do Senhor",
    Quaresma: "Eis o tempo de conversão",
    "Tempo Comum": "Caminhando com Cristo no cotidiano",
    "Tempo Pascal": "Ele Ressuscitou, Aleluia!",
    "Tempo do Natal": "O Verbo se fez carne, e habitou entre nós",
    "Triduo Pascal": "Mistério da Paixão, Morte e Ressurreição de Nosso Senhor",
  };

  const activeSeason = currentPeriod ?? season;
  const phrase = seasonPhrases[activeSeason];

  const seasons = [
    {
      name: "Advento",
      color: "#7b2cbf",
      image: adventoImg,
    },
    {
      name: "Quaresma",
      image: quaresmaImg,
      color: "#3d165f",
    },
    {
      name: "Tempo Comum",
      image: comumImg,
      color: "#18635a",
    },
    {
      name: "Tempo Pascal",
      image: pascalImg,
      color: "#f5c500",
    },
  ];

  return (
    <footer className="liturgical-footer">
      <div className="liturgical-container">
        {/* Title */}
        <div className="liturgical-title-wrapper">
          <h3 className="liturgical-title">
            Tempo Litúrgico Atual:
            <span className="liturgical-current-period">
              {activeSeason}
            </span>
          </h3>

          {phrase && (
            <p className="liturgical-season-phrase">{phrase}</p>
          )}
        </div>

        {/* Season Cards */}
        <div className="liturgical-grid">
          {seasons.map((item) => {
            const isActive =
              activeSeason !== "Triduo Pascal" &&
              item.name === activeSeason;

            return (
              <div
                key={item.name}
                className={`liturgical-season-card ${
                  isActive ? "active" : ""
                }`}
                style={{ backgroundColor: item.color }}
              >
                <div className="liturgical-image-wrapper">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="liturgical-season-content">
                  <p className="liturgical-season-name">
                    {item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
