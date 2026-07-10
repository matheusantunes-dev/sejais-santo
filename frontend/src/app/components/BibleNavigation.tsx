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

  const handleSelectChapter = async (chapter: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedChapter(chapter);
    setStep("verses");
    setVerses([]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl(`/api/bible/${selectedBook!.slug}/${chapter}`), {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Erro ao buscar capítulo");
      const data = await res.json();

      if (controller.signal.aborted) return;
      setVerses(
        (data.verses || []).map((v: any) => ({
          text: v.text,
          number: v.number,
          reference: `${selectedBook!.name} ${chapter}:${v.number}`,
        }))
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Não foi possível carregar o capítulo.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
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

  return (
    <><div className="bible-navigation">
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
