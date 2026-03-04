import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

type Verse = {
  text: string;
  reference: string;
};

export default function VerseShare() {
  const cardRef = useRef<HTMLDivElement>(null);

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerse() {
      try {
        const res = await fetch(
          "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
        );

        const data = await res.json();

        const verseData = data?.verse;

        if (verseData) {
          setVerse({
            text: verseData.text,
            reference: verseData.reference,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar versículo:", err);

        // fallback caso API falhe
        setVerse({
          text: "O Senhor é meu pastor, nada me faltará.",
          reference: "Salmos 23:1",
        });
      }

      setLoading(false);
    }

    fetchVerse();
  }, []);

  async function baixarImagem() {
    if (!cardRef.current) return;

    const dataUrl = await htmlToImage.toPng(cardRef.current);

    const link = document.createElement("a");
    link.download = "versiculo.png";
    link.href = dataUrl;
    link.click();
  }

  function copiarVersiculo() {
    if (!verse) return;

    const texto = `${verse.text} — ${verse.reference}`;

    navigator.clipboard.writeText(texto);
    alert("Versículo copiado!");
  }

  if (loading) {
    return <p>Carregando versículo...</p>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(180deg,#1e0f3b,#3a1f70)",
          color: "white",
          padding: "40px",
          borderRadius: "16px",
          maxWidth: "500px",
          margin: "auto",
          fontFamily: "serif",
        }}
      >
        <h2>📖 Versículo do Dia</h2>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.5,
            marginTop: "20px",
          }}
        >
          {verse?.text}
        </p>

        <p
          style={{
            marginTop: "20px",
            fontWeight: "bold",
          }}
        >
          {verse?.reference}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={baixarImagem}>📥 Baixar imagem</button>

        <button
          onClick={copiarVersiculo}
          style={{ marginLeft: "10px" }}
        >
          📋 Copiar
        </button>
      </div>
    </div>
  );
}
