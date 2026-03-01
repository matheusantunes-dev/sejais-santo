// src/app/components/VerseOrganizerModal.tsx
import React, { useEffect, useState } from "react";
import "./VerseOrganizerModal.css";
import { useAuth } from "../context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

interface SavedVerse {
  id: string;
  text: string;
  note?: string;
  createdAt: number;
  authorEmail?: string;
  _github_path?: string;
}

export function VerseOrganizerModal({ isOpen, onClose, initialText = "" }: Props) {
  const { user, token } = useAuth();
  const [text, setText] = useState(initialText);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setText(initialText || "");
    setNote("");
    if (!user || !token) return;
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialText, user, token]);

  const fetchSaved = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/verses", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.warn("fetchSaved error", res.status);
        setSaved([]);
        setLoading(false);
        return;
      }
      const json = await res.json();
      // map and sort by createdAt ascending
      json.sort((a: SavedVerse, b: SavedVerse) => (a.createdAt || 0) - (b.createdAt || 0));
      setSaved(json);
    } catch (err) {
      console.error("fetchSaved err", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
          <h2>Login necessário</h2>
          <p>Faça login com sua conta Google para usar o organizador de versículos.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!token) return alert("Token ausente");
    const payload = { text, note };
    try {
      const res = await fetch("http://localhost:8000/api/verses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("save error", res.status, txt);
        alert("Erro ao salvar");
        return;
      }
      const savedItem = await res.json();
      setSaved((s) => [...s, savedItem]);
      setText("");
      setNote("");
    } catch (err) {
      console.error("handleSave err", err);
      alert("Erro ao salvar");
    }
  };

  const handleDelete = async (item: SavedVerse) => {
    if (!token) return;
    const ok = confirm("Excluir este versículo?");
    if (!ok) return;
    try {
      const res = await fetch("http://localhost:8000/api/verses", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item._github_path || item.id }),
      });
      if (!res.ok) {
        alert("Erro ao excluir");
        return;
      }
      setSaved((s) => s.filter((x) => (x._github_path || x.id) !== (item._github_path || item.id)));
    } catch (err) {
      console.error("delete err", err);
      alert("Erro ao excluir");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>Organizador de Versículos</h2>

        <label>Versículo / Texto</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />

        <label>Nota (opcional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={() => { setText(""); setNote(""); }}>Limpar</button>
        </div>

        <hr style={{ margin: "16px 0" }} />
        <h3>Salvos</h3>
        {loading && <p>Carregando...</p>}
        {saved.length === 0 && !loading && <p>Nenhum versículo salvo ainda.</p>}
        <ul>
          {saved.map((s) => (
            <li key={s._github_path || s.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{s.text}</div>
              {s.note && <div style={{ color: "#666" }}>{s.note}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button onClick={() => navigator.clipboard?.writeText(s.text)}>Copiar</button>
                <button onClick={() => handleDelete(s)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}