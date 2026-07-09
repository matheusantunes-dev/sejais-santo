// src/app/components/GospelShareModal.tsx
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { toast } from "sonner";

import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
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
    } finally {
      event.target.value = "";
    }
  }

  async function generateFiles() {
    if (!captureRef.current) return [];

    const chunks = buildChunks(gospel?.texto ?? "");
    const files: File[] = [];

    const el = captureRef.current;

    console.log("[GOSPEL_SHARE] chunks build:", chunks.length, chunks.map(c => c.length + "chars"));
    console.log("[GOSPEL_SHARE] captureRect:", el.getBoundingClientRect());

    for (let index = 0; index < chunks.length; index++) {
      setRenderText(chunks[index]);
      await waitForNextPaint();

      const blob = await toBlob(el);
      console.log("[GOSPEL_SHARE] toBlob result:", blob ? `OK ${blob.size}bytes` : "NULL", "chunk", index + 1);

      if (!blob) continue;

      files.push(new File([blob], `share-${index + 1}.png`, { type: "image/png" }));
    }

    console.log("[GOSPEL_SHARE] files generated:", files.length, files.map(f => f.size + "bytes"));
    return files;
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    console.log("[GOSPEL_SHARE] useEffect triggered: open=true, backgroundSrc hash:", backgroundSrc?.slice(-20));
    async function preGenerate() {
      console.log("[GOSPEL_SHARE] preGenerate started");
      const files = await generateFiles();
      console.log("[GOSPEL_SHARE] preGenerate finished, storing", files.length, "files");
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
      console.log("[GOSPEL_SHARE] handleShare files:", files.length, "from", generatedFiles ? "preGenerated" : "fresh", "sizes:", files.map(f => f.size + "bytes"));

      if (!navigator.share || !(navigator as any).canShare?.({ files })) {
        toast.error("Seu navegador não suporta compartilhamento.");
        return;
      }

      await navigator.share({
        files,
        title: shareTitle ?? "Compartilhar",
        text: gospel?.referencia ?? "",
      });

      onClose();
    } finally {
      setIsSharing(false);
      setRenderText(previewText);
    }
  }

  const modal = (
    <Modal
      open={open}
      onClose={onClose}
      className="share-composer-modal"
      overlayClassName="share-composer-overlay"
      labelledBy="share-composer-title"
    >
      <button className="modal-close" onClick={onClose}>×</button>

      <div className="share-composer-header">
        <h3 id="share-composer-title">{shareTitle ?? "Compartilhar"}</h3>
      </div>

      <div className="share-composer-layout">
        <div className="share-composer-preview is-portrait">
          <GospelShareImage
            referencia={gospel.referencia}
            texto={previewText}
            backgroundSrc={backgroundSrc ?? undefined}
            width={252}
            layoutVariant={layoutVariant}
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
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Fechar
            </Button>

            <Button
              variant="primary"
              onClick={handleShare}
              isLoading={isSharing}
              startIcon={Share2}
            >
              {isSharing ? "Gerando..." : "Compartilhar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden-capture-root">
        <GospelShareImage
          ref={captureRef as any}
          referencia={gospel.referencia}
          texto={renderText || previewText}
          backgroundSrc={backgroundSrc ?? undefined}
          layoutVariant={layoutVariant}
        />
      </div>
    </Modal>
  );

  return modal;
}
