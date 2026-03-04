import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

interface Verse {
  text: string;
  reference: string; 
}

export default function DailyVerseCard() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchVerse() {
      try {
        const response = await fetch(
          "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
        );

        const data = await response.json();

        setVerse({
          text: data.verse.details.text,
          reference: data.verse.details.reference,
        });
      } catch (error) {
        console.error("Erro ao buscar versículo:", error);
      }
    }

    fetchVerse();
  }, []);

  const handleShareImage = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "versiculo.png", { type: "image/png" });

      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: "Versículo do Dia",
            text: "Compartilhando o versículo do dia ✝️",
          });
        } catch (error) {
          console.error("Erro ao compartilhar:", error);
        }
      } else {
        const link = document.createElement("a");
        link.download = "versiculo.png";
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    });
  };

  return (
    <div className="verse-container">
      <div className="verse-card" ref={cardRef}>
        <h2 className="verse-title">Versículo do Dia</h2>

        {verse ? (
          <>
            <p className="verse-text">"{verse.text}"</p>
            <p className="verse-reference">{verse.reference}</p>
          </>
        ) : (
          <p>Carregando versículo...</p>
        )}
      </div>

      <button className="share-button" onClick={handleShareImage}>
        Compartilhar
      </button>
    </div>
  );
}
