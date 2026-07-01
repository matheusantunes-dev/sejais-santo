import { useState, useCallback, useRef, useEffect } from "react";
import { isEnabled } from "@/config/features";
import "./BibleSearch.css";

interface SearchResult {
  verse: number;
  text: string;
  chapter: number;
  book: {
    slug: string;
    name: string;
    abbrev: string;
  };
}

interface SearchResponse {
  type: "fts" | "reference" | "book";
  results?: SearchResult[];
  total?: number;
  chapters?: { number: number; verses_count: number }[];
  slug?: string;
}

const BACKEND_BASE = "http://localhost:8000";

export function BibleSearch({ onNavigate }: { onNavigate?: (slug: string, chapter: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/bible/search?q=${encodeURIComponent(q)}&limit=30`);
      if (!res.ok) throw new Error("Erro na busca");
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ type: "fts", results: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const words = q.split(/\s+/).filter(Boolean);
    let result = text;
    for (const w of words) {
      const idx = result.toLowerCase().indexOf(w.toLowerCase());
      if (idx >= 0) {
        result = result.slice(0, idx) + "〈" + result.slice(idx, idx + w.length) + "〉" + result.slice(idx + w.length);
      }
    }
    return result;
  };

  const showChapter = (slug: string, chapter: number) => {
    if (onNavigate) onNavigate(slug, chapter);
  };

  if (!isEnabled("BIBLE_CACHE")) return null;

  return (
    <div className="bible-search">
      <div className="bible-search-input-wrap">
        <input
          type="text"
          className="bible-search-input"
          placeholder="Buscar: Jo 3,16 · amor · Gênesis"
          value={query}
          onChange={handleChange}
        />
        {loading && <span className="bible-search-spinner" />}
      </div>

      {results && (
        <div className="bible-search-results">
          {results.type === "book" && results.chapters && (
            <div className="bible-search-chapters">
              <p className="bible-search-info">
                {results.chapters.length} capítulos
              </p>
            </div>
          )}

          {(results.type === "fts" || results.type === "reference") && results.results && (
            <>
              {results.total === 0 && <p className="bible-search-empty">Nenhum resultado.</p>}

              {results.results.map((r, i) => (
                <div
                  key={i}
                  className="bible-search-result"
                  onClick={() => showChapter(r.book.slug, r.chapter)}
                >
                  <span className="bible-search-ref">
                    {r.book.abbrev} {r.chapter}:{r.verse}
                  </span>
                  <span
                    className="bible-search-text"
                    dangerouslySetInnerHTML={{
                      __html: highlight(r.text, query),
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
