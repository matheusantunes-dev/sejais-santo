import { Calendar } from "lucide-react";
import "./GospelCard.css";

interface LiturgicalMeta {
  season?: string;
  cycle?: string;
  ferial?: string;
  week?: number;
  pericope?: string;
  book_abbrev?: string;
  liturgical_key?: string;
}

interface GospelCardProps {
  gospel: {
    referencia: string;
    texto: string;
  } | null;
  liturgical?: LiturgicalMeta | null;
  loading: boolean;
  error: string | null;
}

function cycleLabel(c?: string): string {
  if (c === "A") return "Ano A";
  if (c === "B") return "Ano B";
  if (c === "C") return "Ano C";
  return c ?? "";
}

export function GospelCard({ gospel, liturgical, loading, error }: GospelCardProps) {
  return (
    <div className="gospel-card">
      <div className="gospel-date-selector">
        <Calendar />
        <span>Evangelho de Hoje</span>
      </div>

      {liturgical && (
        <div className="gospel-liturgical-meta">
          {liturgical.season && <span className="gospel-meta-tag">{liturgical.season}</span>}
          {liturgical.cycle && <span className="gospel-meta-tag">{cycleLabel(liturgical.cycle)}</span>}
          {liturgical.pericope && <span className="gospel-meta-tag">{liturgical.pericope}</span>}
          {liturgical.week != null && <span className="gospel-meta-tag">Semana {liturgical.week}</span>}
        </div>
      )}

      <div className="gospel-preview">
        {loading && <p>Carregando...</p>}
        {error && <p>{error}</p>}
        {gospel && (
          <div className="gospel-content">
            <h4 className="gospel-title">{gospel.referencia}</h4>
            <p className="gospel-text">{gospel.texto}</p>
          </div>
        )}
      </div>
    </div>
  );
}
