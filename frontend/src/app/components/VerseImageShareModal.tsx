// src/app/components/VerseImageShareModal.tsx

import { GospelShareModal } from "./GospelShareModal";

type VerseData = {
  referencia: string;
  texto: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  verse: VerseData | null;
};

/**
 * Este componente apenas reutiliza o modal de compartilhamento do Evangelho.
 * Assim o Versículo do Dia usa:
 * - os mesmos templates
 * - o mesmo CSS
 * - o mesmo sistema rápido de geração de imagens
 */
export function VerseImageShareModal({ open, onClose, verse }: Props) {
  if (!verse) return null;

  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={{
        referencia: verse.referencia,
        texto: verse.texto,
      }}
    />
  );
}
