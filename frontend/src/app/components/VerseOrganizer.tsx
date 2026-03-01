import React, { useEffect, useState } from "react";
import VerseItem from "./VerseItem";
import VerseOrganizerIcon from "./VerseOrganizerIcon";
import "./VerseOrganizer.css";
import { useAuth } from "../context/AuthContext";

type Verse = {
  id: string;
  text: string;
  note?: string | null;
  authorEmail?: string | null;
  authorId?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function VerseOrganizer() {
  const { session } = useAuth();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token;

  useEffect(() => {
    if (token) {
      fetchVerses();
    }
  }, [token]);

  async function fetchVerses() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/verses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar versículos");

      const data = await res.json();
      setVerses(data);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function addVerse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newText.trim()) {
      return setError("Digite um versículo.");
    }

    try {
      const res = await fetch(`${API_URL}/api/verses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newText,
          note: newAuthor || null,
          scheduledAt: newDateTime || null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar.");

      const created = await res.json();
      setVerses((prev) => [created, ...prev]);

      setNewText("");
      setNewAuthor("");
      setNewDateTime("");
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar versículo.");
    }
  }

  async function deleteVerse(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/verses`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Erro ao remover");

      setVerses((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (session === undefined) {
    return <p>Carregando autenticação...</p>;
  }

  if (!session) {
    return (
      <p style={{ padding: 20 }}>
        Faça login com Google para organizar versículos.
      </p>
    );
  }

  return (
    <div className="verse-organizer">
      <header className="vo-header">
        <div className="vo-title">
          <VerseOrganizerIcon />
          <h2>Organizador de Evangelho</h2>
        </div>
      </header>

      <form onSubmit={addVerse}>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Escreva o versículo..."
        />

        <input
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Nota (opcional)"
        />

        <input
          type="datetime-local"
          value={newDateTime}
          onChange={(e) => setNewDateTime(e.target.value)}
        />

        <button type="submit">Adicionar</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Carregando...</p>}

      <section>
        {verses.map((v) => (
          <VerseItem
            key={v.id}
            verse={v}
            onShare={() => deleteVerse(v.id)}
            canShare={true}
          />
        ))}
      </section>
    </div>
  );
}
