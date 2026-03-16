// src/app/components/VerseImageShareModal.tsx
import { GospelShareModal } from "./GospelShareModal";
import type { ShareTemplate } from "../share/shareTemplates";

type Props = {
  open: boolean;
  onClose: () => void;

  // conteúdo do versículo
  text?: string | null;
  reference?: string | null;

  // opções de apresentação (opcionais)
  modalTitle?: string; // título do cabeçalho do modal (ex: "Compartilhar Versículo")
  shareTitle?: string; // título enviado ao share API (ex: "Versículo do Dia")
  templates?: ShareTemplate[]; // sobrescrever templates padrão, se quiser
  defaultBackgroundSrc?: string; // forçar fundo específico para o versículo
  defaultTemplateId?: string | null; // template inicial para abrir o modal

  // props extras que podem vir do chamador — aceitas para compatibilidade, mas não usadas diretamente
  helperText?: string;
  cardLabel?: string;
  fileName?: string;
  loading?: boolean;
};

/**
 * VerseImageShareModal
 *
 * Wrapper minimal que adapta as props do "Versículo do Dia" ao
 * GospelShareModal (sistema de compartilhamento já otimizado).
 *
 * - Evita duplicação de código.
 * - Permite passar título e templates específicos para o versículo.
 */
export function VerseImageShareModal({
  open,
  onClose,
  text,
  reference,
  modalTitle,
  shareTitle,
  templates,
  defaultBackgroundSrc,
  defaultTemplateId,
}: Props) {
  // Se não estiver aberto, não renderiza nada (economiza trabalho).
  if (!open) return null;

  // Normaliza os valores — evita undefined ao passar para GospelShareModal.
  const verseText = text ?? "";
  const verseReference = reference ?? "";

  // Se não houver conteúdo nenhum, também evita abrir o modal.
  // (Isso evita um modal vazio caso os dados ainda não tenham carregado.)
  if (!verseText && !verseReference) return null;

  // Transforma os dados do versículo no shape esperado pelo GospelShareModal
  const gospel = {
    referencia: verseReference,
    texto: verseText,
  };

  // Retorna o modal reutilizando o componente do Evangelho.
  // Passamos shareTitle/modalTitle e overrides de templates/fundos.
  return (
    <GospelShareModal
      open={open}
      onClose={onClose}
      gospel={gospel}
      shareTitle={modalTitle ?? shareTitle ?? "Compartilhar Versículo"}
      templates={templates}
      defaultBackgroundSrc={defaultBackgroundSrc}
      defaultTemplateId={defaultTemplateId ?? null}
    />
  );
}
