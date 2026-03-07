import { Calendar } from "lucide-react";
import "./GospelCard.css";

interface GospelCardProps {
  gospel: {
    referencia: string;
    texto: string;
  } | null;
  loading: boolean;
  error: string | null;
}

/**
 * GospelCard
 * É o container visual que o usuário vê. A ideia é que o html-to-image capture
 * *exatamente* esse elemento (com ref no FeatureCard).
 */
export function GospelCard({ gospel, loading, error }: GospelCardProps) {
  return (
    <div className="gospel-card">
      <div className="gospel-card-top">
        <div className="gospel-badge">
          <Calendar size={16} />
          <span>Evangelho de Hoje</span>
        </div>
      </div>

      <div className="gospel-card-body">
        {loading && <p className="gospel-loading">Carregando...</p>}
        {error && <p className="gospel-error">{error}</p>}
        {gospel && (
          <>
            <h4 className="gospel-ref">{gospel.referencia}</h4>
            <div className="gospel-text-grid">
  <p className="gospel-text">
    {gospel.texto}
  </p>
</div>
          </>
        )}
      </div>

      <div className="gospel-card-footer">
        <span className="gospel-brand">gospelapp</span>
      </div>
    </div>
  );
}
