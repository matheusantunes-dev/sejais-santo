import { useState, useEffect } from "react";
import { isEnabled } from "@/config/features";
import { apiUrl } from "@/lib/api";
import "./SaintsWidget.css";

interface Saint {
  name: string;
  date: string;
  description: string;
}

export function SaintsWidget() {
  const [data, setData] = useState<{ today: Saint | null; upcoming: Saint[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isEnabled("ADVANCED_LITURGICAL_CALENDAR")) {
      setLoading(false);
      return;
    }

    fetch(apiUrl("/liturgical/saints"))
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ today: null, upcoming: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (!isEnabled("ADVANCED_LITURGICAL_CALENDAR")) return null;
  if (loading) return <div className="saints-widget"><p className="saints-loading">Santos...</p></div>;
  if (!data?.today && data?.upcoming?.length === 0) return null;

  const formatDate = (d: string) => {
    const [m, day] = d.split("-");
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${parseInt(day)} de ${meses[parseInt(m) - 1]}`;
  };

  return (
    <div className="saints-widget">
      {data.today && (
        <div className="saint-today">
          <span className="saint-icon">✝</span>
          <div>
            <strong>{data.today.name}</strong>
            <p className="saint-desc">{data.today.description}</p>
          </div>
        </div>
      )}
      {data.upcoming.length > 0 && (
        <div className="saints-upcoming">
          <h4>Próximos santos</h4>
          {data.upcoming.map((s, i) => (
            <div key={i} className="saint-item">
              <span className="saint-date">{formatDate(s.date)}</span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
