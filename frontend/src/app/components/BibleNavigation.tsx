import { useState, useCallback } from "react";
import { BOOKS, type Book } from "@/utils/books";
import "./BibleNavigation.css";

type Step = "book" | "chapter" | "verses";

const BACKEND = "http://localhost:8000/api/bible";

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
    setSelectedChapter(chapter);
    setStep("verses");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND}/${selectedBook!.slug}/${chapter}`);
      if (!res.ok) throw new Error("Erro ao buscar capítulo");
      const data = await res.json();

      setVerses(
        (data.verses || []).map((v: any) => ({
          text: v.text,
          number: v.number,
          reference: `${selectedBook!.name} ${chapter}:${v.number}`,
        }))
      );
    } catch (err) {
      setError("Não foi possível carregar o capítulo.");
    } finally {
      setLoading(false);
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

  return (
    <div className="bible-navigation">
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
                  onClick={() => handleCopyVerse(v.text)}
                  title="Clique para copiar"
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
  );
}
