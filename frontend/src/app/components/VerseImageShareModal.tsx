// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
// importamos todo o módulo de templates (um único arquivo onde você provavelmente já tem as coleções)
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

  // seleciona templates do versículo, se existirem; se não, usa os templates do evangelho como fallback.
  // usamos vários nomes possíveis (verseShareTemplates, versiculoTemplates, verseTemplates)
  // para ser compatível com diferentes nomes de arquivo/exports que você possa ter.
  const verseTemplates =
    // @ts-ignore - acessos dinâmicos ao módulo
    templatesModule.verseShareTemplates ??
    // @ts-ignore
    templatesModule.versiculoTemplates ??
    // @ts-ignore
    templatesModule.verseTemplates ??
    // fallback: templates do evangelho (deve sempre existir)
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
    />
  );
}
