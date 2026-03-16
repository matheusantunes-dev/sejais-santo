"use client";

import { useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { shareFiles } from "../share/shareUtils";
import { ShareTemplatePicker } from "./ShareTemplatePicker";
import { verseShareTemplates } from "../share/shareTemplates";
import "./VersododiaModal.css";

interface Props {
  open: boolean;
  onClose: () => void;

  modalTitle: string;
  helperText: string;
  cardLabel: string;

  text: string;
  reference: string;

  fileName: string;
  shareTitle: string;

  loading?: boolean;
}

export function VerseImageShareModal({
  open,
  onClose,
  modalTitle,
  helperText,
  cardLabel,
  text,
  reference,
  fileName,
  shareTitle,
  loading,
}: Props) {

  const captureRef = useRef<HTMLDivElement | null>(null);

  const [background, setBackground] = useState(verseShareTemplates[0].src);
  const [selectedTemplateId, setSelectedTemplateId] = useState(verseShareTemplates[0].id);
  const [customFileName, setCustomFileName] = useState("");

  if (!open) return null;

  async function handleShare() {
    if (!captureRef.current) return;

    try {

      const blob = await toBlob(captureRef.current, {
        pixelRatio: window.devicePixelRatio || 2,
        backgroundColor: null,
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) return;

      const file = new File([blob], fileName, { type: "image/png" });

      await shareFiles({
        files: [file],
        title: shareTitle,
        text: reference,
      });

      onClose();

    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  }

  function handleTemplateSelect(template: any) {
    setSelectedTemplateId(template.id);
    setBackground(template.src);
    setCustomFileName("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setSelectedTemplateId(null);
    setBackground(url);
    setCustomFileName(file.name);
  }

  return (
    <div className="modal-overlay">

      <div className="modal-container">

        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{modalTitle}</h2>

        <p>{helperText}</p>

        {/* CARD DO VERSÍCULO */}

        <div
          ref={captureRef}
          className="verse-card"
          style={{ backgroundImage: `url(${background})` }}
        >

          <div className="verse-overlay">

            <div className="verse-content">

              <div className="verse-text">
                {loading ? "Carregando..." : text}
              </div>

              <div className="verse-ref">
                {reference}
              </div>

              <div style={{marginTop:20, fontSize:12}}>
                SEJAIS SANTO
              </div>

            </div>

          </div>

        </div>

        {/* TEMPLATES */}

        <ShareTemplatePicker
          heading="Fundos prontos para versiculo"
          helperText="Escolha um dos 5 templates com paisagens e biblia aberta ou use uma foto da galeria."
          templates={verseShareTemplates}
          selectedTemplateId={selectedTemplateId}
          customFileName={customFileName}
          onTemplateSelect={handleTemplateSelect}
          onFileChange={handleFileChange}
          fileInputId="verse-upload"
        />

        {/* BOTÕES */}

        <div className="modal-actions">

          <button className="btn-close" onClick={onClose}>
            Fechar
          </button>

          <button className="btn-share" onClick={handleShare}>
            Compartilhar
          </button>

        </div>

      </div>

    </div>
  );
}
