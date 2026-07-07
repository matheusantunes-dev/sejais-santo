import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

interface Gospel {
  referencia: string;
  texto: string;
}

interface LiturgicalMeta {
  season?: string;
  cycle?: string;
  ferial?: string;
  week?: number;
  pericope?: string;
  book_abbrev?: string;
  liturgical_key?: string;
}

interface CachedGospel {
  date: string;
  gospel: Gospel;
  liturgical: LiturgicalMeta | null;
}

const LS_KEY = "sejais_gospel_cache";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLocalCache(): CachedGospel | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: CachedGospel = JSON.parse(raw);
    if (parsed.date !== getToday()) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveLocalCache(gospel: Gospel, liturgical: LiturgicalMeta | null) {
  try {
    const payload: CachedGospel = { date: getToday(), gospel, liturgical };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch { /* quota exceeded, ignore */ }
}

export function useGospel() {
  const [gospel, setGospel] = useState<Gospel | null>(null);
  const [liturgical, setLiturgical] = useState<LiturgicalMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t0 = performance.now();
    let cancelled = false;

    const local = loadLocalCache();
    if (local) {
      const dt = (performance.now() - t0).toFixed(0);
      console.log(`[GOSPEL_HOOK] localStorage HIT date=${local.date} dt=${dt}ms`);
      setGospel(local.gospel);
      setLiturgical(local.liturgical);
      setLoading(false);
    }

    async function fetchGospel() {
      const t_fetch = performance.now();
      try {
        const response = await fetch(apiUrl("/gospel"));
        const t_resp = performance.now();
        const dt_network = (t_resp - t_fetch).toFixed(0);

        if (!response.ok) {
          throw new Error("Erro ao buscar evangelho");
        }

        const json = await response.json();
        const t_json = performance.now();
        const dt_parse = (t_json - t_resp).toFixed(0);

        const evangelho = json?.leituras?.evangelho?.[0];

        if (!evangelho) {
          throw new Error("Evangelho não encontrado na resposta");
        }

        const gospelData: Gospel = {
          referencia: evangelho.referencia,
          texto: evangelho.texto,
        };
        const liturgicalData: LiturgicalMeta | null = json.liturgical ?? null;

        const dt_total = (performance.now() - t0).toFixed(0);

        console.log(
          `[GOSPEL_HOOK] fetch done network=${dt_network}ms parse=${dt_parse}ms total=${dt_total}ms cached=${json.cached ?? "?"} date=${getToday()}`,
        );

        if (!cancelled) {
          setGospel(gospelData);
          setLiturgical(liturgicalData);
          setError(null);
          setLoading(false);
        }

        saveLocalCache(gospelData, liturgicalData);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Não foi possível carregar o evangelho.");
          setLoading(false);
        }
      }
    }

    if (!local) {
      fetchGospel();
    } else {
      fetchGospel();
    }

    return () => { cancelled = true; };
  }, []);

  return { gospel, liturgical, loading, error };
}
