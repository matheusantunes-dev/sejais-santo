// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
// ajuste o caminho se o seu projeto nomeou o arquivo diferentemente.
// se o seu arquivo de templates do versículo estiver em "../share/shareTemplates" exportando verseShareTemplates,
// ajuste a import para: import { verseShareTemplates } from "../share/shareTemplates";
import { verseShareTemplates } from "../share/verseShareTemplates";

type Props = {
  open: boolean;
  onClose: () => void;
  text?: string | null;
  reference?: string | null;
};

export function VerseImageShareModal({
  open,
  onClose,
  text,
  reference,
}: Props) {
  if (!open) return null;

  const verseText = text ?? "";
  const verseReference = reference ?? "";

  if (!verseText && !verseReference) return null;

  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={{ referencia: verseReference, texto: verseText }}
      shareTitle="Compartilhar Versículo"
      templates={verseShareTemplates}
      templatesHeading="Fundos do Versículo"
      defaultTemplateId={verseShareTemplates?.[0]?.id ?? null}
    />
  );
}
