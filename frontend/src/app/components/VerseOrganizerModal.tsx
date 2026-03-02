import React, { useEffect, useState } from "react";
import "./VerseOrganizerModal.css";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

interface SavedVerse {
  id: string;
  text: string;
  note?: string;
  createdAt?: string;
}

export function VerseOrganizerModal({
  isOpen,
  onClose,
  initialText = "",
}: Props) {
  const { session } = useAuth();
  const token = session?.access_token;

  const [text, setText] = useState(initialText);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) return;
    fetchSaved();
  }, [isOpen, token]);

  const fetchSaved = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar");

      const json = await res.json();
      setSaved(json);
    } catch (err) {
      console.error(err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/verses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, note }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      const savedItem = await res.json();
      setSaved((prev) => [savedItem, ...prev]);
      setText("");
      setNote("");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    }
  };

  if (!isOpen) return null;

  if (!session) {
    return <p>Faça login para usar o organizador.</p>;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>✕</button>
        <h2>Organizador de Versículos</h2>

        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <input value={note} onChange={(e) => setNote(e.target.value)} />

        <button onClick={handleSave}>Salvar</button>

        {loading && <p>Carregando...</p>}

        {saved.map((s) => (
          <div key={s.id}>
            <strong>{s.text}</strong>
            {s.note && <div>{s.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
