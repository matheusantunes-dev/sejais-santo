import { Calendar } from "lucide-react";
import "./GospelCard.css";

interface Gospel {
  referencia: string;
  texto: string;
}

interface GospelCardProps {
  gospel: Gospel | null;
  loading: boolean;
  error: string | null;
}

/**
 * GospelCard - componente puramente visual (dumb component).
 * Ele recebe o evangelho por props e renderiza o layout editorial.
 * A imagem gerada pelo html-to-image deve capturar este container visível.
 */
export function GospelCard({ gospel, loading, error }: GospelCardProps) {
  return (
    <article className="gs-gospel-card" aria-live="polite">
      <header className="gs-gospel-header">
        <div className="gs-badge">
          <Calendar size={16} />
          <span>Evangelho de Hoje</span>
        </div>
        {/* referência visível */}
        {gospel && <div className="gs-ref">{gospel.referencia}</div>}
      </header>

      <section className="gs-gospel-body">
        {loading && <p className="gs-loading">Carregando...</p>}
        {error && <p className="gs-error">{error}</p>}

        {gospel && (
          <div className="gs-text-wrap">
            {/* 
              Usamos um único parágrafo. A diagramação em duas colunas
              é feita por CSS (column-count + column-rule). Isso mantém
              a ordem de leitura natural (coluna por coluna) e mostra
              a linha vertical no meio.
            */}
            <p className="gs-text">{gospel.texto}</p>
          </div>
        )}
      </section>

      <footer className="gs-gospel-footer">
        <small className="gs-brand">gospelapp</small>
      </footer>
    </article>
  );
}
