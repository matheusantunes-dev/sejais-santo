import React, { useEffect, useMemo, useState } from "react";
import VerseItem from "./VerseItem";
import VerseOrganizerIcon from "./VerseOrganizerIcon";
import { VerseImageShareModal } from "./VerseImageShareModal";
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

function formatScheduledAt(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `Agendado para ${date.toLocaleString("pt-BR")}`;
}

export default function VerseOrganizer() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [verses, setVerses] = useState<Verse[]>([]);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

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

      if (!res.ok) throw new Error("Erro ao buscar versiculos");

      const data = await res.json();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      const filtered = data.filter((verse: Verse) => {
        if (!verse.createdAt) return true;

        const age = Date.now() - new Date(verse.createdAt).getTime();
        return age < thirtyDays;
      });

      setVerses(filtered);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addVerse(event: React.FormEvent) {
    event.preventDefault();

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

      setVerses((prev) => prev.filter((verse) => verse.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  const selectedVerseReference = useMemo(() => {
    if (!selectedVerse) return "";

    return [selectedVerse.note, formatScheduledAt(selectedVerse.scheduledAt)]
      .filter(Boolean)
      .join(" | ");
  }, [selectedVerse]);

  if (!session) {
    return <p>Faca login para organizar versiculos.</p>;
  }

  return (
    <>
      <div className="verse-organizer">
        <header>
          <VerseOrganizerIcon />
          <h2>Organizador</h2>
        </header>

        <form onSubmit={addVerse}>
          <textarea
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="Escreva o versiculo..."
          />

          <input
            value={newAuthor}
            onChange={(event) => setNewAuthor(event.target.value)}
            placeholder="Nota (opcional)"
          />

          <input
            type="datetime-local"
            value={newDateTime}
            onChange={(event) => setNewDateTime(event.target.value)}
          />

          <button type="submit">Adicionar</button>
        </form>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {verses.map((verse) => (
          <VerseItem
            key={verse.id}
            verse={verse}
            onShare={() => setSelectedVerse(verse)}
            onDelete={() => deleteVerse(verse.id)}
            canShare={true}
          />
        ))}
      </div>

      <VerseImageShareModal
        open={Boolean(selectedVerse)}
        onClose={() => setSelectedVerse(null)}
        modalTitle="Compartilhar versiculo salvo"
        helperText="Escolha um dos 5 templates com paisagens e biblia aberta ou use uma imagem da galeria do celular para compartilhar o versiculo do organizador."
        cardLabel="Organizador de Versiculos"
        text={selectedVerse?.text ?? ""}
        reference={selectedVerseReference}
        fileName="versiculo-organizado.png"
        shareTitle="Organizador de Versiculos"
      />
    </>
  );
}
