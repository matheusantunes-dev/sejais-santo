// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
// pegamos as opções específicas do versículo do mesmo arquivo de templates
import { verseShareTemplates } from "../share/shareTemplates";

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
      // título do modal
      shareTitle="Compartilhar Versículo"
      // passa templates específicos do versículo (assim os ícones/fundos ficam corretos)
      templates={verseShareTemplates}
      // altera também o texto do picker (para "Fundos do Versículo")
      templatesHeading="Fundos do Versículo"
      // opcional: pode forçar um template inicial via id (ex.: "verse-template-1")
      defaultTemplateId="verse-template-1"
    />
  );
}
