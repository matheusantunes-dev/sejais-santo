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
  templates?: ShareTemplate[]; // override de templates
  defaultBackgroundSrc?: string | null;
  defaultTemplateId?: string | null;

  // permite customizar o título do picker (ex.: "Fundos do Versículo")
  templatesHeading?: string | null;
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
}: GospelShareModalProps) {
  // defensive: se não abriu ou gospel é null, não renderiza
  if (!open || gospel == null) return null;

  // available templates (override possível)
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

  // previewText defensivo: usa gospel.texto se disponível
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (error) {
      console.error("Erro ao carregar imagem personalizada:", error);
      alert("Não foi possível carregar a imagem escolhida.");
    } finally {
      event.target.value = "";
    }
  }

  async function generateFiles() {
    if (!captureRef.current) return [];

    // defensivo: use o texto do gospel atual (não assume não-nulo)
    const textToSplit = gospel?.texto ?? "";
    const chunks = buildChunks(textToSplit);
    const files: File[] = [];
    const safePixelRatio = 1; // velocidade

    const toBlobOptions = {
      pixelRatio: safePixelRatio,
      skipFonts: true,
      cacheBust: true,
    };

    for (let index = 0; index < chunks.length; index += 1) {
      setRenderText(chunks[index]);
      await waitForNextPaint();

      let blob: Blob | null = null;
      try {
        blob = await toBlob(captureRef.current, toBlobOptions);
      } catch (err) {
        console.warn("[GospelShareModal] toBlob falhou na página", index + 1, err);
      }

      if (!blob) continue;

      const fileName = `share-${index + 1}.png`;
      files.push(
        new File([blob], fileName, {
          type: "image/png",
        })
      );

      setProgress({ done: index + 1, total: chunks.length });
    }

    return files;
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function preGenerate() {
      setProgress({ done: 0, total: 0 });
      try {
        const files = await generateFiles();
        if (cancelled) return;
        setGeneratedFiles(files);
        setProgress({ done: files.length, total: files.length });
      } catch (err) {
        console.error("[GospelShareModal] preGenerate erro:", err);
        setGeneratedFiles(null);
        setProgress({ done: 0, total: 0 });
      }
    }

    const id = window.setTimeout(() => preGenerate(), 60);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, backgroundSrc, selectedTemplateId, gospel]);

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const files = generatedFiles ?? (await generateFiles());
      if (!files || files.length === 0) {
        alert("Nenhuma imagem gerada.");
        return;
      }

      let canShareFiles = false;
      try {
        canShareFiles =
          typeof navigator !== "undefined" &&
          typeof (navigator as any).canShare === "function" &&
          (navigator as any).canShare({ files });
      } catch (err) {
        console.warn("[GospelShareModal] navigator.canShare lançou:", err);
        canShareFiles = false;
      }

      if (!canShareFiles || typeof navigator.share !== "function") {
        alert("Seu navegador não suporta compartilhamento de arquivos. Abra no Chrome/Safari para compartilhar imagens.");
        return;
      }

      await navigator.share({
        files,
        title: shareTitle ?? "Compartilhar",
        text: gospel?.referencia ?? "",
      });

      onClose();
    } catch (err: any) {
      if (err && err.name === "AbortError") {
        console.info("[GospelShareModal] compartilhamento cancelado pelo usuário.");
      } else {
        console.error("[GospelShareModal] erro ao compartilhar:", err);
        alert("Erro ao tentar compartilhar. Veja o console para detalhes.");
      }
    } finally {
      setIsSharing(false);
      setRenderText(previewText);
    }
  }

  function handleUseTemplateBackground(src: string) {
    setBackgroundSrc(src);
    setGeneratedFiles(null);
  }

  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="share-composer-close" onClick={onClose}>
          ×
        </button>

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
            />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading={templatesHeading ?? "Fundos"}
              templates={availableTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={(t) => {
                handleTemplateSelect(t);
                handleUseTemplateBackground(t.src);
              }}
              onFileChange={handleFileChange}
            />

            <div className="share-composer-actions">
              <button type="button" className="share-composer-button share-composer-button--secondary" onClick={onClose}>
                Fechar
              </button>

              <button
                type="button"
                className="share-composer-button share-composer-button--primary"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 size={18} />
                {isSharing ? "Gerando..." : generatedFiles ? "Compartilhar" : `Gerando ${progress.done}/${progress.total || "?"}`}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden-capture-root" aria-hidden="true">
          <GospelShareImage
            ref={captureRef as any}
            referencia={gospel?.referencia ?? ""}
            texto={renderText || previewText}
            backgroundSrc={backgroundSrc ?? undefined}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
