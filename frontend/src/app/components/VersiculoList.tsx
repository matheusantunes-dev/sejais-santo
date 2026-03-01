import React from "react";
import VersiculoCard, { Versiculo } from "./VersiculoCard";

/**
 * Usa VITE_API_URL do .env do frontend (melhor que hardcode).
 * Se não existir, cai pra localhost:8000 (dev).
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const VersiculoList: React.FC = () => {
  const [versiculos, setVersiculos] = React.useState<Versiculo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  // ========== Buscar versículos ==========
  const fetchVersiculos = React.useCallback(async () => {
    setLoading(true);
    console.log("[VersiculoList] fetchVersiculos() ->", `${API_URL}/api/verses`);
    try {
      const res = await fetch(`${API_URL}/api/verses`);
      if (!res.ok) {
        const text = await res.text();
        console.error("[VersiculoList] list error:", res.status, text);
        throw new Error("Erro ao listar versículos");
      }
      const data = await res.json();
      setVersiculos(data || []);
      console.log("[VersiculoList] loaded", (data || []).length, "versículos");
    } catch (err) {
      console.error("[VersiculoList] fetchVersiculos catch:", err);
      alert("Falha ao buscar versículos. Veja o console para detalhes.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVersiculos();
  }, [fetchVersiculos]);

  // ========== Adicionar versículo ==========
  const handleAdd = async () => {
    console.log("[VersiculoList] handleAdd called, text:", newText);
    if (!newText.trim()) {
      alert("Digite o versículo.");
      return;
    }

    setAdding(true);

    try {
      const payload = {
        text: newText.trim(),
        note: null,
        scheduledAt: null,
      };

      console.log("[VersiculoList] POST payload:", payload);

      const res = await fetch(`${API_URL}/api/verses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("[VersiculoList] POST failed:", res.status, txt);
        throw new Error("Falha ao adicionar versículo");
      }

      // Se o backend retornar o novo objeto com id, insere sem refetch
      const created = await res.json().catch(() => null);
      if (created && created.id) {
        setVersiculos((prev) => [created, ...prev]);
      } else {
        await fetchVersiculos();
      }

      setNewText("");
    } catch (err) {
      console.error("[VersiculoList] handleAdd error:", err);
      alert("Erro ao adicionar versículo. Veja o console.");
    } finally {
      setAdding(false);
    }
  };

  // ========== Deletar ==========
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir?");
    if (!confirmed) return;

    try {
      console.log("[VersiculoList] deleting", id);
      const res = await fetch(`${API_URL}/api/verses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("[VersiculoList] DELETE failed:", res.status, txt);
        throw new Error("Erro ao deletar");
      }

      setVersiculos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("[VersiculoList] handleDelete error:", err);
      alert("Erro ao deletar versículo.");
    }
  };

  // ========== UI ==========
  return (
    <div>
      <div className="header">
        <h1>Evangelho do Dia — Organização</h1>
      </div>

      <div style={{ marginBottom: 16 }} className="form-inline">
        <textarea
          rows={3}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Escreva seu versículo aqui..."
        />

        {/* IMPORTANTE: type="button" para evitar comportamento de submit silencioso */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {loading && <div>Carregando...</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {versiculos.map((v) => (
          <VersiculoCard
            key={v.id}
            versiculo={v}
            onDelete={handleDelete}
            onShare={() => handleDelete(v.id)}
            onUpdateSchedule={async (id: string, isoDate: string | null) => {}}
            canShare={true}
          />
        ))}
      </div>
    </div>
  );
};

export default VersiculoList;