// src/app/components/VerseImageShareModal.tsx

import { GospelShareModal } from "./GospelShareModal";

type Props = {
  open: boolean;
  onClose: () => void;

  text: string;
  reference: string;

  loading?: boolean;

  modalTitle?: string;
  helperText?: string;
  cardLabel?: string;

  fileName?: string;
  shareTitle?: string;
};

export function VerseImageShareModal({
  open,
  onClose,
  text,
  reference,
}: Props) {

  if (!open) return null;

  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={{
        referencia: reference,
        texto: text,
      }}
    />
  );
}
