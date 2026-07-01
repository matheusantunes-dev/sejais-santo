import { useEffect, useState } from "react";

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

export function useGospel() {
  const [gospel, setGospel] = useState<Gospel | null>(null);
  const [liturgical, setLiturgical] = useState<LiturgicalMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGospel() {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${API_URL}/gospel`);

        if (!response.ok) {
          throw new Error("Erro ao buscar evangelho");
        }

        const json = await response.json();

        const evangelho = json?.leituras?.evangelho?.[0];

        if (!evangelho) {
          throw new Error("Evangelho não encontrado na resposta");
        }

        setGospel({
          referencia: evangelho.referencia,
          texto: evangelho.texto,
        });

        if (json.liturgical) {
          setLiturgical(json.liturgical);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o evangelho.");
      } finally {
        setLoading(false);
      }
    }

    fetchGospel();
  }, []);

  return { gospel, liturgical, loading, error };
}
