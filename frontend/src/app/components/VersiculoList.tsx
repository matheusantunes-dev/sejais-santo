import React from "react";
import VersiculoCard, { Versiculo } from "./VersiculoCard";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export const VersiculoList: React.FC = () => {
  const { session } = useAuth();
  const token = session?.access_token;

  const [versiculos, setVersiculos] = React.useState<Versiculo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const fetchVersiculos = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao listar versículos");

      const data = await res.json();
      setVersiculos(data || []);
    } catch (err) {
      console.error(err);
      alert("Falha ao buscar versículos.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchVersiculos();
  }, [fetchVersiculos]);

  const handleAdd = async () => {
    if (!newText.trim()) {
      alert("Digite o versículo.");
      return;
    }

    if (!token) return;

    setAdding(true);

    try {
      const res = await fetch(`${API_URL}/verses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newText.trim(),
          note: null,
          scheduledAt: null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao adicionar versículo");

      const created = await res.json();
      setVersiculos((prev) => [created, ...prev]);
      setNewText("");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar versículo.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = window.confirm("Tem certeza que deseja excluir?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/verses`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Erro ao deletar");

      setVersiculos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar.");
    }
  };

  if (!session) {
    return <p>Faça login para visualizar seus versículos.</p>;
  }

  return (
    <div>
      <h1>Organização de Versículos</h1>

      <div style={{ marginBottom: 16 }}>
        <textarea
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Escreva seu versículo aqui..."
        />
        <button type="button" onClick={handleAdd} disabled={adding}>
          {adding ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {loading && <div>Carregando...</div>}

      {versiculos.map((v) => (
        <VersiculoCard
          key={v.id}
          versiculo={v}
          onDelete={handleDelete}
          onShare={() => handleDelete(v.id)}
          onUpdateSchedule={() => {}}
          canShare={true}
        />
      ))}
    </div>
  );
};

export default VersiculoList;
