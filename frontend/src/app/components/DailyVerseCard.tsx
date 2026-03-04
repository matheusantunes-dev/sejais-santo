import { useEffect, useRef, useState } from "react";

interface Verse {
  text: string;
  reference: string;
}

/**
 * DailyVerseCard
 * - Busca um versículo simples (OurManna) para exibir no card.
 * - Converte o card em imagem usando html2canvas **dinamicamente importado** (melhor para build & bundle).
 * - Compartilha a imagem via Web Share API (com fallback para download).
 */
export default function DailyVerseCard() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sharing, setSharing] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Busca o versículo ao montar o componente
  useEffect(() => {
    let mounted = true;

    async function fetchVerse() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
        );
        const data = await res.json();

        if (!mounted) return;

        setVerse({
          text: data?.verse?.details?.text ?? "Versículo indisponível",
          reference: data?.verse?.details?.reference ?? "",
        });
      } catch (err) {
        console.error("Erro ao buscar versículo:", err);
        if (mounted) setVerse({ text: "Erro ao carregar versículo", reference: "" });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchVerse();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * handleShareImage
   * - importa dinamicamente html2canvas no momento do share (reduz bundle inicial)
   * - gera canvas com escala maior para qualidade (bom para stories 1080x1920)
   * - converte para blob e cria File para usar com navigator.share
   */
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setSharing(true);

    try {
      // import dinâmico para evitar problemas de bundling e reduzir bundle inicial
      const html2canvas = (await import("html2canvas")).default;

      // configurações: escala para exportar imagem em alta resolução
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // aumenta resolução; ajuste se necessário
        useCORS: true,
        backgroundColor: null, // mantém transparência se tiver
      });

      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error("Não foi possível gerar blob da imagem");
            resolve();
            return;
          }

          const file = new File([blob], "versiculo.png", { type: "image/png" });

          // preferir Web Share API com arquivos (apenas em navegadores móveis modernos)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await (navigator as any).share({
                files: [file],
                title: "Versículo do Dia",
                text: verse ? `${verse.text} — ${verse.reference}` : "Versículo do Dia",
              });
            } catch (err) {
              console.error("Erro ao chamar navigator.share:", err);
            }
          } else {
            // fallback: download do PNG
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "versiculo.png";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }

          resolve();
        }, "image/png");
      });
    } catch (err) {
      console.error("Erro no processo de gerar/compartilhar imagem:", err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div
        ref={cardRef}
        // classe específica e "scoped" para evitar colisões de CSS globais
        className="dailyverse-card scoped-dailyverse"
        // estilo inline básico como fallback. Recomendo mover para CSS module.
        style={{
          width: 1080 / 3, // exibe menor na UI, mas exportamos em escala maior
          maxWidth: "100%",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          background: "linear-gradient(180deg, #fffdfa 0%, #f7f1e6 100%)",
          color: "#1b1b1b",
          textAlign: "center",
          fontFamily: "'Georgia', serif",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.8 }}>Sejais Santo</div>

        <h2 style={{ margin: "12px 0", fontSize: 20 }}>Versículo do Dia</h2>

        {loading ? (
          <p>Carregando versículo...</p>
        ) : verse ? (
          <>
            <p style={{ fontSize: 16, lineHeight: 1.3, margin: "12px 0" }}>
              "{verse.text}"
            </p>
            <p style={{ marginTop: 8, fontWeight: 600 }}>{verse.reference}</p>
          </>
        ) : (
          <p>Versículo indisponível</p>
        )}

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          sejaissanto.com
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleShareImage}
          disabled={sharing}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#0b6cff",
            color: "white",
            fontWeight: 600,
          }}
        >
          {sharing ? "Preparando..." : "Compartilhar como imagem (Stories)"}
        </button>
      </div>
    </div>
  );
}
