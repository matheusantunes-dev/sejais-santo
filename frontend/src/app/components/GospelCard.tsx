import { Calendar } from "lucide-react";
import { useGospel } from "../services/useGospel";
import { useEffect } from "react";

interface GospelCardProps {
  gospel: {
    referencia: string;
    texto: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export function GospelCard({ gospel, loading, error }: GospelCardProps) {
  return (
    <div className="gospel-card">
      <div className="gospel-date-selector">
        <Calendar />
        <span>Evangelho de Hoje</span>
      </div>

      <div className="gospel-preview">
        {loading && <p>Carregando...</p>}
        {error && <p>{error}</p>}
        {gospel && (
          <div clasName="gospel-content">
            <h4>{gospel.referencia}</h4>
            <p>{gospel.texto}</p>
          </div>
        )}
      </div>
    </div>
  );
}
