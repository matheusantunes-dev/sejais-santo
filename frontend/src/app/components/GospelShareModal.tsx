// src/app/components/GospelShareModal.tsx

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { createPortal } from "react-dom"
import { Share2 } from "lucide-react"
import { toBlob } from "html-to-image"

import { GospelShareImage } from "./GospelShareImage"
import { ShareTemplatePicker } from "./ShareTemplatePicker"
import { gospelShareTemplates, type ShareTemplate } from "../share/shareTemplates"
import { fileToDataUrl, waitForNextPaint } from "../share/shareUtils"

import "./ShareComposer.css"

interface GospelData {
  referencia: string
  texto: string
}

interface GospelShareModalProps {
  open: boolean
  onClose: () => void
  gospel: GospelData | null
}

/* ----------------------------------------- */
/* helpers para dividir texto em páginas */
/* ----------------------------------------- */

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? []
}

function buildChunks(text: string) {

  const sentences = splitSentences(text)

  const chunks: string[] = []

  let current = ""

  const MAX_CHARS = 900

  for (const sentence of sentences) {

    if ((current + sentence).length > MAX_CHARS && current.length > 200) {

      chunks.push(current.trim())

      current = sentence + " "

    } else {

      current += sentence + " "

    }
  }

  if (current.trim()) chunks.push(current.trim())

  return chunks.length ? chunks : [text]
}

/* ----------------------------------------- */

export function GospelShareModal({
  open,
  onClose,
  gospel
}: GospelShareModalProps) {

  const defaultTemplate = gospelShareTemplates[1]

  const captureRef = useRef<HTMLDivElement>(null)

  const [backgroundSrc, setBackgroundSrc] = useState(defaultTemplate.src)
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id)
  const [customFileName, setCustomFileName] = useState("")

  const [renderText, setRenderText] = useState("")

  const [isSharing, setIsSharing] = useState(false)

  const [generatedFiles, setGeneratedFiles] = useState<File[] | null>(null)

  const [progress, setProgress] = useState({ done: 0, total: 0 })

  /* ----------------------------------------- */

  const previewText = useMemo(() => {

    if (!gospel) return ""

    return buildChunks(gospel.texto)[0]

  }, [gospel])

  /* ----------------------------------------- */

  useEffect(() => {

    if (!open || !gospel) return

    setBackgroundSrc(defaultTemplate.src)
    setSelectedTemplateId(defaultTemplate.id)

    setGeneratedFiles(null)

    setRenderText(previewText)

  }, [open, gospel, previewText])

  /* ----------------------------------------- */
  /* GERAÇÃO OTIMIZADA DAS IMAGENS */
  /* ----------------------------------------- */

  async function generateFiles() {

    if (!captureRef.current) return []

    const chunks = buildChunks(gospel!.texto)

    const files: File[] = []

    const pixelRatio = 1

    for (let i = 0; i < chunks.length; i++) {

      setRenderText(chunks[i])

      await waitForNextPaint()

      const blob = await toBlob(captureRef.current, {

        pixelRatio,

        skipFonts: true,

        cacheBust: true
      })

      if (!blob) continue

      const file = new File([blob], `evangelho-${i + 1}.png`, {
        type: "image/png"
      })

      files.push(file)

      setProgress({
        done: i + 1,
        total: chunks.length
      })
    }

    return files
  }

  /* ----------------------------------------- */
  /* PRÉ-GERAÇÃO AUTOMÁTICA */
  /* ----------------------------------------- */

  useEffect(() => {

    if (!open || !gospel) return

    let cancelled = false

    async function run() {

      setProgress({ done: 0, total: 0 })

      const files = await generateFiles()

      if (cancelled) return

      setGeneratedFiles(files)
    }

    run()

    return () => {
      cancelled = true
    }

  }, [open, backgroundSrc])

  /* ----------------------------------------- */
  /* SHARE */
  /* ----------------------------------------- */

  async function handleShare() {

    if (isSharing) return

    setIsSharing(true)

    try {

      const files = generatedFiles ?? await generateFiles()

      if (!files?.length) {

        alert("Erro ao gerar imagens")

        return
      }

      if (!navigator.share) {

        alert("Seu navegador não suporta compartilhamento")

        return
      }

      await navigator.share({
        files,
        title: "Evangelho do Dia",
        text: gospel!.referencia
      })

      onClose()

    } catch (err: any) {

      if (err?.name !== "AbortError") {

        console.error("Erro ao compartilhar:", err)

        alert("Erro ao compartilhar")
      }

    } finally {

      setIsSharing(false)
    }
  }

  /* ----------------------------------------- */

  function handleTemplateSelect(template: ShareTemplate) {

    setSelectedTemplateId(template.id)

    setBackgroundSrc(template.src)

    setGeneratedFiles(null)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {

    const file = event.target.files?.[0]

    if (!file) return

    const dataUrl = await fileToDataUrl(file)

    setSelectedTemplateId("custom")

    setBackgroundSrc(dataUrl)

    setCustomFileName(file.name)

    setGeneratedFiles(null)
  }

  /* ----------------------------------------- */

  if (!open || !gospel) return null

  /* ----------------------------------------- */

  const modal = (

    <div
      className="share-composer-overlay"
      onClick={onClose}
    >

      <div
        className="share-composer-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="share-composer-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="share-composer-header">
          <h3>Compartilhar Evangelho</h3>
        </div>

        <div className="share-composer-layout">

          <div className="share-composer-preview">

            <GospelShareImage
              referencia={gospel.referencia}
              texto={previewText}
              backgroundSrc={backgroundSrc}
              width={250}
            />

          </div>

          <div className="share-composer-side">

            <ShareTemplatePicker
              heading="Fundos"
              templates={gospelShareTemplates}
              selectedTemplateId={selectedTemplateId}
              customFileName={customFileName}
              onTemplateSelect={handleTemplateSelect}
              onFileChange={handleFileChange}
            />

            <div className="share-composer-actions">

              <button
                className="share-composer-button share-composer-button--secondary"
                onClick={onClose}
              >
                Fechar
              </button>

              <button
                className="share-composer-button share-composer-button--primary"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share2 size={18} />

                {generatedFiles
                  ? "Compartilhar"
                  : `Gerando ${progress.done}/${progress.total}`
                }

              </button>

            </div>

          </div>

        </div>

        {/* hidden capture */}

        <div className="hidden-capture-root">

          <GospelShareImage
            ref={captureRef as any}
            referencia={gospel.referencia}
            texto={renderText || previewText}
            backgroundSrc={backgroundSrc}
          />

        </div>

      </div>

    </div>
  )

  return createPortal(modal, document.body)
}
