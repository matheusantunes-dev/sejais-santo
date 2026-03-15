// src/app/components/GospelShareModal.tsx
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, waitForNextPaint, shareFilesRobust } from "../share/shareUtils";
import "./ShareComposer.css";

interface GospelData {
  referencia: string;
  texto: string;
}

interface GospelShareModalProps {
  open: boolean;
  onClose: () => void;
  gospel: GospelData | null;
}

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? [];
}

function buildChunks(text: string) {
  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let current = "";
  const MAX_CHARS = 900;

  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHARS && current.length > 200) {
      chunks.push(current.trim());
      current = `${sentence} `;
    } else {
      current += `${sentence} `;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.trim()];
}

export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[1];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");

  const captureRef = useRef<HTMLDivElement>(null);

  const previewText = useMemo(() => {
    if (!gospel) return "";
    return buildChunks(gospel.texto)[0] ?? gospel.texto;
  }, [gospel]);

  useEffect(() => {
    if (!open) return;
    setSelectedTemplateId(defaultTemplate.id);
    setBackgroundSrc(defaultTemplate.src);
    setCustomFileName("");
    setRenderText(previewText);
  }, [defaultTemplate.id, defaultTemplate.src, open, previewText]);

  if (!open || !gospel || typeof document === "undefined") return null;

  function handleTemplateSelect(template: ShareTemplate) {
    setSelectedTemplateId(template.id);
    setBackgroundSrc(template.src);
    setCustomFileName("");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedTemplateId(null);
      setBackgroundSrc(dataUrl);
      setCustomFileName(file.name);
    } catch (err) {
      console.error("[GospelShareModal] fileToDataUrl erro:", err);
      alert("Não foi possível carregar a imagem escolhida.");
    } finally {
      event.currentTarget.value = "";
    }
  }

  async function generateFiles(): Promise<File[]> {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel.texto);
    const files: File[] = [];

    for (let i = 0; i < chunks.length; i++) {
      setRenderText(chunks[i]);
      await waitForNextPaint();

      // Se forem muitas páginas, reduzimos pixelRatio pra evitar arquivos enormes
      const multi = chunks.length > 1;
      const devicePR = window.devicePixelRatio || 1;
      const pixelRatio = multi ? Math.min(1.5, devicePR) : Math.max(1, devicePR);

      const dataUrl = await toPng(captureRef.current, {
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      files.push(
        new File([blob], `evangelho-${i + 1}.png`, {
          type: "image/png",
        })
      );
      console.info(`[GospelShareModal] gerou arquivo evangelho-${i + 1}.png size=${blob.size}`);
    }

    return files;
  }

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const files = await generateFiles();

      if (!files.length) throw new Error("Nenhuma imagem gerada");

      // Tenta o share robusto (múltiplos arquivos → individuais → texto)
      const shared = await shareFilesRobust({
        files,
        title: "Evangelho do Dia",
        text: "Evangelho do Dia",
        url: window.location.href,
      });

      if (!shared) {
        // nenhum método abriu o share sheet
        alert("Seu navegador não suporta compartilhar imagens (ou bloqueou). Abra o site no Chrome/Safari direto.");
      } else {
        // sucesso: fecha
        onClose();
      }
    } catch (err) {
      console.error("[GospelShareModal] erro handleShare:", err);
      alert("Erro ao compartilhar o evangelho.");
    } finally {
      setRenderText(previewText);
      setIsSharing(false);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div
