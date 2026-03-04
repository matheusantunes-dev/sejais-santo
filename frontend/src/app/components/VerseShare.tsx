import React, { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

/**
 * VerseShare
 *
 * Componente que:
 * - busca o versículo do dia numa API pública (ourmanna)
 * - renderiza um "card" no formato story (1080x1920)
 * - converte este card em PNG usando html-to-image
 *
 * Uso: coloque <VerseShare /> em qualquer lugar do app.
 *
 * Observações:
 * - html-to-image precisa que o conteúdo esteja no mesmo DOM (same-origin). Por isso não usamos iframe.
 * - explico cada bloco abaixo para você aprender como evoluir o código.
 */

export default function VerseShare(): JSX.Element {
  // ref para o elemento que será convertido em imagem
  const cardRef = useRef<HTMLDivElement | null>(null);

  // estado que guarda o versículo e referência (ex: "Salmos 23:1")
  const [texto, setTexto] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ao montar, buscamos o versículo do dia na API do ourmanna
  useEffect(() => {
    // ourmanna oferece um endpoint simples que retorna JSON com o versículo.
    // Usamos "format=json" e "order=daily" para tentar pegar o versículo do dia.
    // Se preferir outra API (bible-api, labs.bible.org), podemos trocar facilmente.
    const url = "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily";

    async function fetchVerse() {
      try {
        setLoading(true);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        // Estrutura retornada:
        // { verse: { text: "...", reference: "Book 1:1" }, ... }
        const verse = json?.verse;
        const text = verse?.text?.replace(/\s+/g, " ").trim() ?? "";
        const ref = verse?.details ?? verse?.reference ?? "";
        setTexto(text);
        setReferencia(ref);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar versículo:", err);
        setError("Falha ao obter versículo. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, []);

  // Função que gera a imagem PNG a partir do cardRef usando html-to-image.
  const gerarImagem = async () => {
    if (!cardRef.current) return;

    try {
      // Ajustes para gerar imagem em alta resolução no formato de story
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        // largura e altura desejadas para stories (1080x1920)
        width: 1080,
        height: 1920,
        // opcional: background color se precisar garantir branco (ou transparente)
        backgroundColor: "#ffffff",
      });

      // Cria link para download
      const link = document.createElement("a");
      link.download = "versiculo-story.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao gerar imagem. Veja o console para detalhes.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Gerador de Story — Versículo do Dia</h3>

      {loading && <p>Carregando versículo...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Este é o card que será renderizado e convertido em imagem.
          Ele tem tamanho fixo (1080x1920) para caber nos stories.
          Você pode ajustar tipografia, imagens de fundo, e branding aqui. */}
      <div
        ref={cardRef}
        style={{
          width: 1080,
          height: 1920,
          maxWidth: "100%",
          marginTop: 12,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg,#0f1724,#1e293b)", // fundo escuro elegante
          color: "#fff",
          padding: 80,
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ opacity: 0.85, fontSize: 22, fontWeight: 600 }}>
            Versículo do Dia
          </div>

          <div
            style={{
              marginTop: 30,
              fontSize: 56,
              lineHeight: 1.18,
              fontFamily: "Georgia, 'Times New Roman', serif",
              whiteSpace: "pre-wrap",
            }}
          >
            {texto || "—"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, opacity: 0.9 }}>{referencia}</div>
          <div style={{ marginTop: 28, fontSize: 18, opacity: 0.6 }}>
            @seusite.com
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={gerarImagem} style={{ padding: "8px 14px", fontSize: 16 }}>
          Baixar imagem (PNG)
        </button>
        <span style={{ marginLeft: 12, color: "#666" }}>
          Pronto para postar nos Stories.
        </span>
      </div>

      <p style={{ marginTop: 12, color: "#666" }}>
        Nota técnica: este card é renderizado no DOM da sua aplicação (same-origin),
        por isso <strong>html-to-image</strong> consegue capturá-lo. Se você usar um iframe de outro domínio,
        a captura não funcionará por políticas do navegador (CORS).
      </p>
    </div>
  );
}
