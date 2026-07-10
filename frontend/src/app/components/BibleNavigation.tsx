import { useState, useCallback, useRef } from "react";
import { BOOKS, type Book } from "@/utils/books";
import { apiUrl } from "@/lib/api";
import { VerseImageShareModal } from "./VerseImageShareModal";
import "./BibleNavigation.css";

type Step = "book" | "chapter" | "verses";

interface VerseData {
  text: string;
  number: number;
  reference: string;
}

export function BibleNavigation() {
  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testament, setTestament] = useState<"AT" | "NT" | null>(null);
  const [shareVerse, setShareVerse] = useState<VerseData | null>(null);
  const [chapterInput, setChapterInput] = useState("");
  const [directInput, setDirectInput] = useState("");
  const [directError, setDirectError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filteredBooks = testament
    ? BOOKS.filter((b) => b.testament === testament)
    : BOOKS;

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setStep("chapter");
    setVerses([]);
    setError(null);
  };

  const handleNavigateToBookChapter = async (book: Book, chapter: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedBook(book);
    setSelectedChapter(chapter);
    setStep("verses");
    setVerses([]);
    setLoading(true);
    setError(null);
    setDirectError(null);

    try {
      const res = await fetch(apiUrl(`/api/bible/${book.slug}/${chapter}`), {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Erro ao buscar capítulo");
      const data = await res.json();

      if (controller.signal.aborted) return;
      setVerses(
        (data.verses || []).map((v: any) => ({
          text: v.text,
          number: v.number,
          reference: `${book.name} ${chapter}:${v.number}`,
        }))
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Não foi possível carregar o capítulo.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleSelectChapter = async (chapter: number) => {
    if (!selectedBook) return;
    await handleNavigateToBookChapter(selectedBook, chapter);
  };

  const handleBack = () => {
    if (step === "verses") {
      setStep("chapter");
      setVerses([]);
    } else if (step === "chapter") {
      setStep("book");
      setSelectedBook(null);
    }
  };

  const handleCopyVerse = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleCloseShare = useCallback(() => setShareVerse(null), []);

  const handleChapterInput = () => {
    const ch = Number(chapterInput);
    if (!selectedBook) {
      setChapterError("Selecione um livro primeiro");
      return;
    }
    if (ch < 1 || ch > selectedBook.chapters) {
      setChapterError(`Capítulo inválido (1-${selectedBook.chapters})`);
      return;
    }
    setChapterError(null);
    handleSelectChapter(ch);
    setChapterInput("");
  };

  const handleDirectSearch = () => {
    const trimmed = directInput.trim();
    if (!trimmed) return;

    const match = trimmed.match(/^(.+?)\s+(\d+)$/);
    if (!match) {
      setDirectError("Digite livro + capítulo (ex: Êxodo 22)");
      return;
    }

    const bookQuery = match[1].trim().toLowerCase();
    const chapterNum = parseInt(match[2], 10);

    const book = BOOKS.find(
      (b) =>
        b.name.toLowerCase() === bookQuery ||
        b.id === bookQuery ||
        b.slug === bookQuery ||
        b.name.toLowerCase().startsWith(bookQuery) ||
        b.slug.startsWith(bookQuery)
    );

    if (!book) {
      setDirectError("Livro não encontrado");
      return;
    }

    if (chapterNum < 1 || chapterNum > book.chapters) {
      setDirectError(`${book.name} tem apenas ${book.chapters} capítulos`);
      return;
    }

    setDirectInput("");
    setDirectError(null);
    handleNavigateToBookChapter(book, chapterNum);
  };

  return (
    <><div className="bible-navigation">
      <div className="bible-direct-search">
        <input
          type="text"
          className="bible-direct-search-input"
          placeholder="Buscar livro + capítulo (ex: Êxodo 22)"
          value={directInput}
          onChange={(e) => { setDirectInput(e.target.value); setDirectError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleDirectSearch()}
        />
        <button className="bible-direct-search-btn" onClick={handleDirectSearch}>Ir</button>
      </div>
      {directError && <p className="bible-search-error">{directError}</p>}
      {step !== "book" && (
        <button className="bible-back-btn" onClick={handleBack}>
          ← Voltar
        </button>
      )}

      {step === "book" && (
        <div className="bible-book-list">
          <div className="bible-testament-tabs">
            <button
              className={testament === null ? "active" : ""}
              onClick={() => setTestament(null)}
            >
              Todos
            </button>
            <button
              className={testament === "AT" ? "active" : ""}
              onClick={() => setTestament("AT")}
            >
              Antigo Testamento
            </button>
            <button
              className={testament === "NT" ? "active" : ""}
              onClick={() => setTestament("NT")}
            >
              Novo Testamento
            </button>
          </div>

          <div className="bible-books-grid">
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                className="bible-book-btn"
                onClick={() => handleSelectBook(book)}
              >
                {book.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "chapter" && selectedBook && (
        <div>
          <h3 className="bible-chapter-title">{selectedBook.name}</h3>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
            <label htmlFor="chapter-input" style={{ fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>Capítulo:</label>
            <input
              id="chapter-input"
              type="number"
              min={1}
              max={selectedBook.chapters}
              value={chapterInput}
              onChange={(e) => setChapterInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChapterInput()}
              style={{ flex: 1, maxWidth: 100, padding: "0.4rem 0.6rem", borderRadius: 6, border: "1px solid var(--color-neutral-300)", fontSize: "var(--text-base)" }}
            />
            <button className="bible-chapter-btn" onClick={handleChapterInput}>Ir</button>
          </div>
          {chapterError && <p className="bible-chapter-error">{chapterError}</p>}

          <p style={{ textAlign: "center", color: "var(--color-neutral-400)", fontSize: "var(--text-sm)", marginBottom: "0.75rem" }}>
            — ou clique abaixo —
          </p>

          <div className="bible-chapters-grid">
            {Array.from(
              { length: selectedBook.chapters },
              (_, i) => i + 1
            ).map((ch) => (
              <button
                key={ch}
                className="bible-chapter-btn"
                onClick={() => handleSelectChapter(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "verses" && (
        <div className="bible-verses">
          {loading && <p className="bible-loading">Carregando...</p>}
          {error && <p className="bible-error">{error}</p>}
          {!loading && !error && (
            <>
              <h3 className="bible-verses-title">
                {selectedBook?.name} {selectedChapter}
              </h3>
              {verses.map((v) => (
                <div
                  key={`${v.number}`}
                  className="bible-verse"
                  onClick={() => setShareVerse(v)}
                  title="Clique para compartilhar"
                >
                  <span className="bible-verse-num">{v.number}</span>
                  <span className="bible-verse-text">{v.text}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
      {shareVerse && (
        <VerseImageShareModal
          open={!!shareVerse}
          onClose={handleCloseShare}
          modalTitle="Compartilhar versículo"
          helperText="Escolha um plano de fundo e compartilhe"
          cardLabel="Palavra do Dia"
          text={shareVerse.text}
          reference={shareVerse.reference}
          fileName={`versiculo-${shareVerse.reference.replace(/\s+/g, "-").replace(/:/g, "-").toLowerCase()}.png`}
          shareTitle={`${shareVerse.reference} — Sejais Santo`}
        />
      )}
    </>
  );
}
