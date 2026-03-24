import React from "react";

/**
 * Versiculo card: exibe texto, autor, data agendada e ações.
 */
export type Versiculo = {
  id: string;
  text: string;
  author?: string | null;
  scheduledAt?: string | null;
};

type Props = {
  versiculo: Versiculo;
  onDelete: (id: string) => Promise<void> | void;
  onShare?: (id: string) => Promise<void> | void;
  onUpdateSchedule?: (id: string, isoDate: string | null) => Promise<void> | void;
  canShare?: boolean;
};

const VersiculoCard: React.FC<Props> = ({
  versiculo,
  onDelete,
  onShare,
  onUpdateSchedule,
  canShare = false,
}) => {
  const [loadingDelete, setLoadingDelete] = React.useState(false);

  const handleDeleteClick = async () => {
    setLoadingDelete(true);
    try {
      await onDelete(versiculo.id);
    } catch (err) {
      console.error("VersiculoCard delete error:", err);
      alert("Erro ao remover versículo.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>{versiculo.text}</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {versiculo.author ? `Autor: ${versiculo.author}` : "Autor: —"}
        </div>
        {versiculo.scheduledAt ? (
          <div style={{ fontSize: 12, color: "#666" }}>
            Agendado para: {new Date(versiculo.scheduledAt).toLocaleString()}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {canShare && onShare ? (
          <button type="button" onClick={() => onShare(versiculo.id)}>
            Compartilhar
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={loadingDelete}
        >
          {loadingDelete ? "Removendo..." : "Remover"}
        </button>
      </div>
    </div>
  );
};

export default VersiculoCard;