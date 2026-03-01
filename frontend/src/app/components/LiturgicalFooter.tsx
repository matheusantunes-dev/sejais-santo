import "./LiturgicalFooter.css";
import adventoImg from "@/assets/advento.png";
import pascalImg from "@/assets/pascal.png";
import quaresmaImg from "@/assets/quaresma.png";
import comumImg from "@/assets/tempo comum.png";
import { getLiturgicalSeason } from "@/utils/LiturgicalCalendar";
import { useEffect, useState } from "react";

interface LiturgicalFooterProps {
  currentPeriod?: string;
}

console.log("Data do sistema:", new Date());
console.log("Tempo litúrgico atual:", getLiturgicalSeason(new Date()));


export function LiturgicalFooter({ currentPeriod }: LiturgicalFooterProps) {
  const [season, setSeason] = useState<string>(() =>
    getLiturgicalSeason(new Date()),
  );

  useEffect(() => {
    const interval = setInterval(
      () => {
        setSeason(getLiturgicalSeason(new Date()));
      },
      1000 * 60 * 60,
    );

    return () => clearInterval(interval);
  }, []);

  const activeSeason = currentPeriod ?? season;
  console.log("Props recebidas:", { currentPeriod });

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
            <span className="liturgical-current-period">{activeSeason}</span>
          </h3>
        </div>

        {/* Season Cards */}
        <div className="liturgical-grid">
          {seasons.map((item) => {
            const isActive = item.name === activeSeason;

            return (
              <div
                key={item.name}
                className={`liturgical-season-card ${isActive ? "active" : ""}`}
                style={{ backgroundColor: item.color }}
              >
                <div className="liturgical-image-wrapper">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="liturgical-season-content">
                  <p className="liturgical-season-name">{item.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
