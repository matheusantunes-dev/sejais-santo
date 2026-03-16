// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
// ajuste este import se o seu arquivo de templates estiver em outro lugar.
// se você exporta verseShareTemplates de ../share/shareTemplates, mantenha o import abaixo.
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

  const verseTemplates =
    // @ts-ignore - suporte a variados nomes/exports para compatibilidade entre branches
    templatesModule.verseShareTemplates ??
    // @ts-ignore
    templatesModule.versiculoTemplates ??
    // @ts-ignore
    templatesModule.verseTemplates ??
    // fallback seguro: gospel templates (garante build mesmo sem arquivo separado)
    // @ts-ignore
    templatesModule.gospelShareTemplates ??
    [];

  const defaultTemplateId = (verseTemplates && verseTemplates[0] && verseTemplates[0].id) ?? null;

  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={{ referencia: verseReference, texto: verseText }}
      shareTitle="Compartilhar Versículo"
      templates={verseTemplates}
      templatesHeading="Fundos do Versículo"
      defaultTemplateId={defaultTemplateId}
      layoutVariant="versiculo"
    />
  );
}
