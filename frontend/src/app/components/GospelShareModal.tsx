// src/app/components/GospelShareModal.tsx
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { GospelShareImage } from "./GospelShareImage";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates";
import { fileToDataUrl, waitForNextPaint } from "../share/shareUtils";
import "./ShareComposer.css";

/**
 * PROFESSIONAL GospelShareModal
 *
 * Fluxo:
 * 1) Preparar imagens (geração): gera 1..N File[] e mantém em memória (estado)
 * 2) Compartilhar: chama navigator.share(files) rapidamente (minimiza chance de cancelamento)
 *
 * Por que isso ajuda:
 * - evita gerar imagens durante o diálogo nativo de share (alguns navegadores cancelam)
 * - evita travar o DOM por gerar muitos blobs em sequência sem pausas
 * - oferece fallback de texto/url quando arquivos não são suportados
 * - orienta o usuário a abrir no navegador externo quando estiver em In-App browsers
 */

/* --- Tipos simples --- */
interface GospelData {
  referencia: string;
  texto: string;
}

interface GospelShareModalProps {
  open: boolean;
  onClose: () => void;
  gospel: GospelData | null;
}

/* --- util para dividir texto em sentenças e chunks (páginas) --- */
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

/* --- detecta In-App browsers (heurística simples) --- */
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";
  const lower = ua.toLowerCase();
  // Mobile apps in-app common signatures
  return (
    lower.includes("instagram") ||
    lower.includes("fbav") ||
    lower.includes("fban") ||
    lower.includes("twitter") ||
    lower.includes("linkedin") ||
    lower.includes("pinterest") ||
    lower.includes("wechat") ||
    lower.includes("whatsapp") // alguns UA mostram whatsapp
  );
}

/* --- small sleep util --- */
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function GospelShareModal({ open, onClose, gospel }: GospelShareModalProps) {
  const defaultTemplate = gospelShareTemplates[1];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplate.id);
  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src);
  const [customFileName, setCustomFileName] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [renderText, setRenderText] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<File[] | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
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
    // limpa geração anterior para evitar inconsistências
    setGeneratedFiles(null);
    setProgress(null);
  }, [defaultTemplate.id, defaultTemplate.src, open, previewText]);

  if (!open || !gospel || typeof document === "undefined") return null;

  /* --- Template picker handlers --- */
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
      console.error("Erro ao ler arquivo do usuário:", err);
      alert("Não foi possível carregar a imagem escolhida.");
    } finally {
      event.target.value = "";
    }
  }

  /* --- A lógica profissional de geração --- */
  async function prepareImages() {
    if (isPreparing) return;
    if (!captureRef.current) {
      alert("Erro interno: área de captura não encontrada.");
      return;
    }

    setIsPreparing(true);
    setGeneratedFiles(null);
    setProgress({ current: 0, total: 0 });

    try {
      const chunks = buildChunks(gospel.texto);
      const total = chunks.length;
      setProgress({ current: 0, total });

      // Ajuste dinâmico do pixelRatio e pausas baseado em memória
      const deviceMemory = (navigator as any).deviceMemory || 4; // GB hint (não suportado em todos)
      const pixelRatio = deviceMemory >= 4 ? 1.5 : 1; // se muito memória, aumenta um pouco; caso contrário 1
      const pauseMs = deviceMemory >= 4 ? 120 : 300; // pausa maior em dispositivos fracos

      const files: File[] = [];

      for (let i = 0; i < total; i++) {
        setRenderText(chunks[i]);
        // garante o layout atualizado
        await waitForNextPaint();

        // pequena espera extra para mobile real-world (reduz travamentos)
        await sleep(pauseMs);

        // usa toBlob (mais eficiente em memória que dataURL)
        const blob = await toBlob(captureRef.current as any, {
          pixelRatio,
          cacheBust: true,
          skipFonts: true,
        });

        if (!blob) throw new Error("Falha ao gerar imagem (blob nulo).");

        const file = new File([blob], `evangelho-${i + 1}.png`, { type: "image/png" });
        files.push(file);

        // atualiza progresso (sem expor URLs)
        setProgress({ current: i + 1, total });

        // pequena pausa pós-criação para aliviar GC/heap pressure
        await sleep(80);
      }

      setGeneratedFiles(files);
      // opcionalmente mantemos renderText no preview do primeiro chunk
      setRenderText(chunks[0]);
    } catch (err) {
      console.error("Erro ao preparar imagens:", err);
      alert("Erro ao gerar imagens no dispositivo. Tente reduzir o tamanho do texto ou usar outro navegador.");
    } finally {
      setIsPreparing(false);
      setProgress((p) => (p ? { ...p } : null));
    }
  }

  /* --- Função de compartilhar (rápida, usa arquivos preparados) --- */
  async function doSharePreparedFiles() {
    if (isSharing) return;
    if (!generatedFiles || generatedFiles.length === 0) {
      alert("Primeiro prepare as imagens (botão 'Preparar imagens').");
      return;
    }

    setIsSharing(true);
    try {
      // se canShare existe, cheque; se não existir, tente na prática (compatibilidade)
      const canCheck = typeof (navigator as any).canShare === "function";
      const canShareFiles = canCheck ? (navigator as any).canShare({ files: generatedFiles }) : true;

      if (typeof navigator.share === "function" && canShareFiles) {
        await navigator.share({ files: generatedFiles, title: "Evangelho do Dia" });
        onClose();
        return;
      }

      // fallback: tentar compartilhar texto/url para abrir o share sheet
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: "Evangelho do Dia", text: "Evangelho do Dia", url: window.location.href });
          onClose();
          return;
        } catch (err) {
          console.warn("Fallback text share falhou:", err);
        }
      }

      // Se chegamos aqui: provavelmente in-app browser que bloqueia share de arquivos
      if (isInAppBrowser()) {
        // UX: sugerir abrir no navegador externo
        const open = confirm(
          "Seu navegador embutido (app) não permite compartilhar imagens. Deseja abrir esta página no navegador para compartilhar?"
        );
        if (open) {
          // Tenta abrir no navegador padrão; em muitos webviews isso força abrir externo
          window.open(window.location.href, "_blank");
        }
        return;
      }

      alert("Seu navegador não suporta compartilhar imagens neste contexto.");
    } catch (err) {
      console.error("Erro no compartilhamento:", err);
      alert("Erro ao compartilhar. Tente em outro navegador.");
    } finally {
      setIsSharing(false);
    }
  }

  /* --- UI --- */
  const modal = (
    <div className="share-composer-overlay" onClick={onClose}>
      <div className="share-composer-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="share-composer-close" onClick={onClose}>
          x
        </button>

        <div className="share-composer-header">
          <h3>Compartilhar Evangelho</h3>
          <p style={{ marginTop: 6 }}>
            Gere as imagens primeiro (isso evita travamentos no mobile). Em seguida toque em
            "Compartilhar" para abrir o menu nativo.
          </p>
        </div>

        <div className="share-composer-layout">
          <div className="share-composer-preview is-portrait">
            <GospelShareImage referencia={gospel.referencia} texto={previewText} backgroundSrc={backgroundSrc} width={252} />
          </div>

          <div className="share-composer-side">
            <ShareTemplatePicker
              heading="Fundos do Evangelho"
              helperText="Escolha um template ou imagem da galeria."
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
              fileInputId="gospel-background-file"
            />

            <div style={{ marginTop: 12 }}>
              {!generatedFiles && (
                <button
                  className="share-composer-button share-composer-button--primary"
                  onClick={prepareImages}
                  disabled={isPreparing}
                >
                  {isPreparing ? `Gerando... (${progress?.current || 0}/${progress?.total || "?"})` : "Preparar imagens"}
                </button>
              )}

              {generatedFiles && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Pronto:</strong> {generatedFiles.length} imagem{generatedFiles.length > 1 ? "s" : ""}
                  </div>

                  <button
                    className="share-composer-button share-composer-button--primary"
                    onClick={doSharePreparedFiles}
                    disabled={isSharing}
                  >
                    {isSharing ? "Compartilhando..." : "Compartilhar"}
                  </button>

                  <button
                    className="share-composer-button share-composer-button--secondary"
                    onClick={() => {
                      // liberar referências para GC
                      setGeneratedFiles(null);
                      setProgress(null);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Limpar imagens
                  </button>
                </>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <button className="share-composer-button share-composer-button--secondary" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>

        {/* área oculta para captura: renderiza uma instância do template para tirar screenshots */}
        <div className="hidden-capture-root" aria-hidden="true" style={{ position: "absolute", left: -9999, top: -9999 }}>
          <GospelShareImage ref={captureRef} referencia={gospel.referencia} texto={renderText || previewText} backgroundSrc={backgroundSrc} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
