"use client";

import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import versiculobg from "@/assets/versiculobg.jpg";
import "./VersododiaModal.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface VerseApi {
  text: string;
  reference: string;
}

export function VersododiaModal({ open, onClose }: Props) {
  const [verseText, setVerseText] = useState("");
  const [verseRef, setVerseRef] = useState("");
  const [loading, setLoading] = useState(false);

  const bgSrc = (versiculobg as any)?.src ?? (versiculobg as unknown as string);

  /*
  ==========================================================
  BUSCA DO VERSÍCULO VIA API
  ==========================================================
  */
  useEffect(() => {
    if (!open) return;

    async function loadVerse() {
      try {
        const res = await fetch(
          "https://bible-api.com/?random=verse&translation=almeida",
        );

        const data = await res.json();

        const verseText = data.text.replace(/\n/g, " ").trim();

        const verseRef = data.reference;

        setVerseText(verseText);
        setVerseRef(verseRef);

        console.log("Verso:", verseText);
        console.log("Ref:", verseRef);
      } catch (error) {
        console.error("Erro ao buscar versículo:", error);
      }
    }
    loadVerse();
  }, [open]);

  /*
  ==========================================================
  FUNÇÃO PARA QUEBRAR TEXTO
  ==========================================================
  */
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line ? line + " " + words[n] : words[n];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }

    if (line) lines.push(line);

    return lines;
  }

  /*
  ==========================================================
  GERADOR DE IMAGEM
  ==========================================================
  */
  async function renderImageBlob(width = 1080, height = 1080): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Erro canvas");

    const img = new Image();
    img.src = bgSrc;

    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    ctx.drawImage(img, 0, 0, width, height);

    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(0, 0, width, height);

    const fontSize = 60;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `700 ${fontSize}px Georgia`;

    const padding = 140;

    const lines = wrapText(ctx, verseText, width - padding * 2);

    const lineHeight = fontSize * 1.3;

    const totalHeight = lines.length * lineHeight;

    let startY = height / 2 - totalHeight / 2;

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 4;

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;

      ctx.strokeText(line, width / 2, y);
      ctx.fillText(line, width / 2, y);
    });

    if (verseRef) {
      ctx.font = `600 40px Georgia`;

      const refY = startY + lines.length * lineHeight + 80;

      ctx.fillStyle = "#f5e6a7";

      ctx.strokeText(verseRef, width / 2, refY);
      ctx.fillText(verseRef, width / 2, refY);
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );

    if (!blob) throw new Error("Erro blob");

    return blob;
  }

  /*
  ==========================================================
  SHARE
  ==========================================================
  */
  async function handleShare() {
    if (loading) return;

    if (!verseText) {
      alert("Versículo ainda carregando.");
      return;
    }

    setLoading(true);

    try {
      const blob = await renderImageBlob();

      const file = new File([blob], "versiculo.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Versículo do Dia",
        });
      } else {
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "versiculo.png";
        a.click();

        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h3>Versículo do Dia</h3>

        <div
          className="verse-card"
          style={{
            backgroundImage: `url(${bgSrc})`,
          }}
        >
          <div className="verse-content">
            <p className="verse-text">“{verseText}”</p>
            <p className="verse-ref">{verseRef}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-share" onClick={handleShare}>
            <Share2 size={18} />
            {loading ? "Gerando..." : "Compartilhar"}
          </button>

          <button className="btn-close" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default VersododiaModal;
