
﻿"use client";

import { useEffect, useState } from "react";
import { VerseImageShareModal } from "./VerseImageShareModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FALLBACK_VERSE = {
  text: "O Senhor e meu pastor, nada me faltara.",
  reference: "Salmos 23:1",
};

export function VersododiaModal({ open, onClose }: Props) {
  const [verseText, setVerseText] = useState("");
  const [verseRef, setVerseRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadVerse() {
      setLoading(true);

      try {
        const res = await fetch("https://bible-api.com/?random=verse&translation=almeida");
        const data = await res.json();

        const nextVerseText = String(data?.text ?? "").replace(/\n/g, " ").trim();
        const nextVerseRef = String(data?.reference ?? "").trim();

        if (!active) return;

        setVerseText(nextVerseText || FALLBACK_VERSE.text);
        setVerseRef(nextVerseRef || FALLBACK_VERSE.reference);
      } catch (error) {
        console.error("Erro ao buscar versiculo:", error);

        if (!active) return;

        setVerseText(FALLBACK_VERSE.text);
        setVerseRef(FALLBACK_VERSE.reference);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVerse();

    return () => {
      active = false;
    };
  }, [open]);

  return (
    <VerseImageShareModal
      open={open}
      onClose={onClose}
      modalTitle="Versiculo do Dia"
      helperText="Escolha um dos 5 templates com paisagens e biblia aberta ou use uma imagem da galeria do celular antes de compartilhar."
      cardLabel="Versiculo do Dia"
      text={verseText}
      reference={verseRef}
      fileName="versiculo-do-dia.webp"
      shareTitle="Versiculo do Dia"
      loading={loading}
    />
  );
}

export default VersododiaModal;
