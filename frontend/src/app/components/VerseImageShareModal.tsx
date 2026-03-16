// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
import * as templatesModule from "../share/shareTemplates";

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

  // pega templates do versículo se existirem, senão usa gospel como fallback
  const verseTemplates =
    // @ts-ignore
    templatesModule.verseShareTemplates ??
    // @ts-ignore
    templatesModule.versiculoTemplates ??
    // @ts-ignore
    templatesModule.verseTemplates ??
    // fallback
    // @ts-ignore
    templatesModule.gospelShareTemplates ??
    [];

  const defaultTemplateId =
    (verseTemplates && verseTemplates[0] && verseTemplates[0].id) ?? null;

  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={{ referencia: verseReference, texto: verseText }}
      shareTitle="Compartilhar Versículo"
      templates={verseTemplates}
      templatesHeading="Fundos do Versículo"
      defaultTemplateId={defaultTemplateId}
      // ESSA LINHA: indica ao modal qual layout usar
      layoutVariant="versiculo"
    />
  );
}
