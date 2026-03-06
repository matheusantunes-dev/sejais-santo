import React, { useEffect, useState } from "react";
import VerseItem from "./VerseItem";
import VerseOrganizerIcon from "./VerseOrganizerIcon";
import "./VerseOrganizer.css";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

type Verse = {
  id: string;
  text: string;
  note?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
};

export default function VerseOrganizer() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [verses, setVerses] = useState<Verse[]>([]);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchVerses();
  }, [token]);

  async function fetchVerses() {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar versículos");

      const data = await res.json();

      // 🧹 ANTI COME-BD
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      const filtered = data.filter((v: Verse) => {
        if (!v.createdAt) return true;

        const age = Date.now() - new Date(v.createdAt).getTime();
        return age < THIRTY_DAYS;
      });

      setVerses(filtered);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addVerse(e: React.FormEvent) {
    e.preventDefault();

    if (!newText.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/verses`, {
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

      if (!res.ok) throw new Error("Erro ao salvar");

      const created = await res.json();

      setVerses((prev) => [created, ...prev]);

      setNewText("");
      setNewAuthor("");
      setNewDateTime("");

    } catch (err: any) {
      setError(err.message);
    }
  }

  function shareVerse(text: string) {
    if (navigator.share) {
      navigator.share({
        title: "Versículo",
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Versículo copiado para área de transferência.");
    }
  }

  async function deleteVerse(id: string) {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/verses`, {
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

  if (!session) {
    return <p>Faça login para organizar versículos.</p>;
  }

  return (
    <div className="verse-organizer">

      <header>
        <VerseOrganizerIcon />
        <h2>Organizador</h2>
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

      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}

      {verses.map((v) => (
        <VerseItem
          key={v.id}
          verse={v}
          onShare={() => shareVerse(v.text)}
          onDelete={() => deleteVerse(v.id)}
          canShare={true}
        />
      ))}

    </div>
  );
}
