// src/components/VerseImageShareModal.tsx
import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image"; // ou outra lib que você use
import { shareFilesOrDownload } from "../share/shareUtils";

type Props = {
  onClose: () => void;
  shareTitle?: string;
  // outros props que seu modal usa...
};

export function VerseImageShareModal({ onClose, shareTitle = "Evangelho" }: Props) {
  const captureRef = useRef<HTMLDivElement | null>(null); // elemento a ser convertido para imagem
  const [fallbackUrls, setFallbackUrls] = useState<string[] | null>(null);

  // Guarda URLs para revogar quando fechar ou trocar
  useEffect(() => {
    return () => {
      // revoga object URLs quando o componente desmontar
      if (fallbackUrls && fallbackUrls.length) {
        fallbackUrls.forEach((u) => URL.revokeObjectURL(u));
      }
    };
  }, [fallbackUrls]);

  // Função chamada quando usuário clica em "Compartilhar"
  async function handleShareClick() {
    // 1) pega o elemento e converte em blob (imagem)
    if (!captureRef.current) {
      console.error("[VerseShare] captureRef not found");
      return;
    }

    try {
      // IMPORTANTE: escolhi skipFonts=false para preservar fontes custom.
      // pixelRatio aumenta resolução da imagem; ajuste conforme necessidade.
      const blob = await toBlob(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
      });

      if (!blob) {
        console.error("[VerseShare] html-to-image returned null blob");
        return;
      }

      // 2) transformar em File (necessário para navigator.share com files)
      const fileName = `${shareTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // 3) chamar a util e receber resultado (não força download automático)
      const result = await shareFilesOrDownload({
        files: [file],
        title: shareTitle,
        text: shareTitle,
        url: window.location.href,
      });

      // 4) se for fallback, exibir links para o usuário abrir manualmente
      if (!result.didShare && result.fallbackUrls && result.fallbackUrls.length) {
        // revoke antigos, se existirem
        if (fallbackUrls && fallbackUrls.length) {
          fallbackUrls.forEach((u) => URL.revokeObjectURL(u));
        }
        setFallbackUrls(result.fallbackUrls);
      } else {
        // sucesso no share — fecha modal se quiser
        setFallbackUrls(null);
        onClose();
      }
    } catch (err) {
      console.error("[VerseShare] error generating or sharing image:", err);
    }
  }

  function handleClearLinks() {
    if (fallbackUrls) {
      fallbackUrls.forEach((u) => URL.revokeObjectURL(u));
    }
    setFallbackUrls(null);
  }

  return (
    <div className="verse-share-modal">
      {/* Capture area — o conteúdo que será transformado em imagem */}
      <div ref={captureRef} id="verse-capture" style={{ padding: 16 }}>
        {/* seu markup do evangelho aqui */}
        <h2>{shareTitle}</h2>
        <p>Texto do evangelho — substitua com seu conteúdo dinâmico</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleShareClick} aria-label="Compartilhar">
          Compartilhar
        </button>

        <button onClick={() => { handleClearLinks(); onClose(); }}>
          Fechar
        </button>
      </div>

      {fallbackUrls && fallbackUrls.length > 0 && (
        <div className="fallback-links" style={{ marginTop: 12 }}>
          <p>
            Seu navegador não suporta compartilhamento de arquivos diretamente. Abra a(s) imagem(s)
            abaixo e compartilhe manualmente:
          </p>
          <ul>
            {fallbackUrls.map((u, idx) => (
              <li key={u}>
                {/* abrimos em nova aba para não forçar o download */}
                <a href={u} target="_blank" rel="noreferrer">
                  Abrir evangelho-{idx + 1}.png
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 8 }}>
            <button onClick={handleClearLinks}>Limpar links</button>
          </div>
        </div>
      )}
    </div>
  );
}
