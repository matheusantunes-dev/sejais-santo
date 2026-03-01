import { useEffect, useState } from "react";

interface Gospel {
  referencia: string;
  texto: string;
}

export function useGospel() {
  const [gospel, setGospel] = useState<Gospel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGospel() {
      try {
        const response = await fetch("/api/gospel");

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
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o evangelho.");
      } finally {
        setLoading(false);
      }
    }

    fetchGospel();
  }, []);

  return { gospel, loading, error };
}