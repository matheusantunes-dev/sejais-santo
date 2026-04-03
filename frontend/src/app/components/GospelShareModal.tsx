// src/app/components/GospelShareModal.tsx
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, waitForNextPaint } from "../share/shareUtils";
import "./ShareComposer.css";

interface GospelData {
  referencia: string;
  texto: string;
}

interface GospelShareModalProps {
  open: boolean;
  onClose: () => void;
  gospel: GospelData | null;
  shareTitle?: string;
  templates?: ShareTemplate[];
  defaultBackgroundSrc?: string | null;
  defaultTemplateId?: string | null;
  templatesHeading?: string | null;
  layoutVariant?: "evangelho" | "versiculo" | string | null;
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

export function GospelShareModal({
  open,
  onClose,
  gospel,
  shareTitle,
  templates,
  defaultBackgroundSrc = null,
  defaultTemplateId = null,
  templatesHeading = null,
  layoutVariant = "evangelho",
}: GospelShareModalProps) {
  if (!open || gospel == null) return null;

  const availableTemplates = templates ?? gospelShareTemplates;
  const defaultTemplate =
    availableTemplates.find((t) => t.id === defaultTemplateId) ?? availableTemplates[0];

  const captureRef = useRef<HTMLDivElement>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    defaultTemplate?.id ?? null
  );
  const [backgroundSrc, setBackgroundSrc] = useState<string | null>(
    defaultBackgroundSrc ?? defaultTemplate?.src ?? null
  );
  const [customFileName, setCustomFileName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<File[] | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // 👇 CONTROLE DE LOTES
  const [currentChunk, setCurrentChunk] = useState(0);
  const CHUNK_SIZE = 5;

  const previewText = useMemo(() => {
    const text = gospel?.texto ?? "";
    return buildChunks(text)[0] ?? text;
  }, [gospel]);

  useEffect(() => {
    if (!open) return;

    setSelectedTemplateId(defaultTemplate?.id ?? null);
    setBackgroundSrc(defaultBackgroundSrc ?? defaultTemplate?.src ?? null);
    setCustomFileName("");
    setRenderText(previewText);
    setGeneratedFiles(null);
    setProgress({ done: 0, total: 0 });

    // 👇 RESET DO LOTE
    setCurrentChunk(0);
  }, [open, defaultTemplate?.id, defaultTemplate?.src, defaultBackgroundSrc, previewText]);

  function handleTemplateSelect(template: ShareTemplate) {
    setSelectedTemplateId(template.id);
    setBackgroundSrc(template.src);
    setCustomFileName("");
    setGeneratedFiles(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedTemplateId(null);
      setBackgroundSrc(dataUrl);
      setCustomFileName(file.name);
      setGeneratedFiles(null);
    } catch {
      alert("Erro ao carregar imagem.");
    } finally {
      event.target.value = "";
    }
  }

  async function generateFiles() {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel?.texto ?? "");
    const files: File[] = [];

    for (let i = 0; i < chunks.length; i++) {
      setRenderText(chunks[i]);
      await waitForNextPaint();

      const blob = await toBlob(captureRef.current, {
        pixelRatio: 1,
        skipFonts: true,
        cacheBust: true,
      });

      if (!blob) continue;

      files.push(new File([blob], `share-${i + 1}.png`, { type: "image/png" }));
      setProgress({ done: i + 1, total: chunks.length });
    }

    return files;
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function preGenerate() {
      const files = await generateFiles();
      if (!cancelled) setGeneratedFiles(files);
    }

    const id = setTimeout(preGenerate, 60);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, backgroundSrc, selectedTemplateId, gospel]);

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const files = generatedFiles ?? (await generateFiles());
      if (!files?.length) {
        alert("Nenhuma imagem.");
        return;
      }

      const start = currentChunk * CHUNK_SIZE;
      const chunk = files.slice(start, start + CHUNK_SIZE);

      if (!chunk.length) {
        alert("Todas as partes já foram compartilhadas 🙏");
        return;
      }

      await navigator.share({
        files: chunk,
        title: shareTitle ?? "Compartilhar",
        text: gospel?.referencia ?? "",
      });

      setCurrentChunk((prev) => prev + 1);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(err);
        alert("Erro ao compartilhar.");
      }
    } finally {
      setIsSharing(false);
      setRenderText(previewText);
    }
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-composer-close" onClick={onClose}>×</button>

        <div className="share-composer-header">
          <h3>{shareTitle ?? "Compartilhar"}</h3>
        </div>

        <div className="share-composer-layout">
          <div className="share-composer-preview is-portrait">
            <GospelShareImage
              referencia={gospel?.referencia ?? ""}
              texto={previewText}
              backgroundSrc={backgroundSrc ?? undefined}
              width={252}
              layoutVariant={layoutVariant ?? "evangelho"}
            />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading={templatesHeading ?? "Fundos"}
              templates={availableTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
            />

            <div className="share-composer-actions">
              <button onClick={onClose}>Fechar</button>

              <button onClick={handleShare} disabled={isSharing}>
                <Share2 size={18} />
                {isSharing
                  ? "Enviando..."
                  : generatedFiles
                    ? `Parte ${currentChunk + 1} de ${Math.ceil(generatedFiles.length / CHUNK_SIZE)}`
                    : "Gerando..."}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden-capture-root">
          <GospelShareImage
            ref={captureRef as any}
            referencia={gospel?.referencia ?? ""}
            texto={renderText || previewText}
            backgroundSrc={backgroundSrc ?? undefined}
            layoutVariant={layoutVariant ?? "evangelho"}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
