import { useState, useCallback, useRef, useEffect } from "react";
import { BOOKS, type Book } from "@/utils/books";
import { apiUrl } from "@/lib/api";
import { VerseImageShareModal } from "./VerseImageShareModal";
import "./BibleNavigation.css";

type Step = "book" | "book-menu" | "verses" | "fullbook";

interface VerseData {
  text: string;
  number: number;
  reference: string;
}

interface FullBookChapter {
  number: number;
  verses_count: number;
  verses: Array<{ number: number; text: string }>;
}

export function BibleNavigation() {
  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [fullBookData, setFullBookData] = useState<FullBookChapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testament, setTestament] = useState<"AT" | "NT" | null>(null);
  const [shareVerse, setShareVerse] = useState<VerseData | null>(null);
  const [chapterInput, setChapterInput] = useState("");
  const [chapterError, setChapterError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filteredBooks = testament
    ? BOOKS.filter((b) => b.testament === testament)
    : BOOKS;

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setChapterInput("");
    setChapterError(null);
    setError(null);
    setVerses([]);
    setFullBookData([]);
    setStep("book-menu");
  };

  const handleReadChapter = () => {
    const ch = Number(chapterInput);
    if (!selectedBook) return;
    if (ch < 1 || ch > selectedBook.chapters) {
      setChapterError(`Capítulo inválido (1-${selectedBook.chapters})`);
      return;
    }
    setChapterError(null);
    setSelectedChapter(ch);
    setStep("verses");
  };

  const handleReadFullBook = () => {
    if (!selectedBook) return;
    setStep("fullbook");
  };

  useEffect(() => {
    if (step !== "verses" || !selectedBook || selectedChapter === null) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setVerses([]);
    setLoading(true);
    setError(null);

    const book = selectedBook;
    const chapter = selectedChapter;

    fetch(apiUrl(`/api/bible/${book.slug}/${chapter}`), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar capítulo");
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setVerses(
          (data.verses || []).map((v: any) => ({
            text: v.text,
            number: v.number,
            reference: `${book.name} ${chapter}:${v.number}`,
          }))
        );
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Não foi possível carregar o capítulo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedBook?.id, selectedChapter]);

  useEffect(() => {
    if (step !== "fullbook" || !selectedBook) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setFullBookData([]);
    setLoading(true);
    setError(null);

    const book = selectedBook;

    fetch(apiUrl(`/api/bible/${book.slug}`), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar livro");
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setFullBookData(data.chapters || []);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Não foi possível carregar o livro.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedBook?.id]);

  const handleBack = () => {
    if (step === "verses" || step === "fullbook") {
      setStep("book-menu");
      setVerses([]);
      setFullBookData([]);
    } else if (step === "book-menu") {
      setStep("book");
      setSelectedBook(null);
    }
  };

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

      {step === "book-menu" && selectedBook && (
        <div className="bible-book-menu">
          <h3 className="bible-book-menu-title">{selectedBook.name}</h3>
          <p className="bible-book-menu-subtitle">
            {selectedBook.chapters} capítulos • {selectedBook.testament === "AT" ? "Antigo" : "Novo"} Testamento
          </p>

          <div className="bible-book-menu-cards">
            <div className="bible-menu-card">
              <span className="bible-menu-card-icon">📖</span>
              <span className="bible-menu-card-title">Ler um capítulo específico</span>
              <span className="bible-menu-card-desc">Escolha o número do capítulo</span>
              <div className="bible-menu-card-input-row">
                <input
                  type="number"
                  min={1}
                  max={selectedBook.chapters}
                  placeholder={`1-${selectedBook.chapters}`}
                  value={chapterInput}
                  onChange={(e) => setChapterInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReadChapter()}
                />
                <button className="bible-menu-card-go" onClick={handleReadChapter}>Ir</button>
              </div>
              {chapterError && <p className="bible-chapter-error">{chapterError}</p>}
            </div>

            <button className="bible-menu-card" onClick={handleReadFullBook}>
              <span className="bible-menu-card-icon">📚</span>
              <span className="bible-menu-card-title">Ler livro completo</span>
              <span className="bible-menu-card-desc">
                Todos os {selectedBook.chapters} capítulos em sequência
              </span>
            </button>
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

      {step === "fullbook" && (
        <div className="bible-fullbook">
          {loading && <p className="bible-loading">Carregando...</p>}
          {error && <p className="bible-error">{error}</p>}
          {!loading && !error && (
            <>
              <h3 className="bible-fullbook-title">{selectedBook?.name}</h3>
              {fullBookData.map((ch) => (
                <div key={ch.number} className="bible-fullbook-chapter">
                  <h4 className="bible-fullbook-chapter-title">Capítulo {ch.number}</h4>
                  {ch.verses.map((v) => {
                    const ref = `${selectedBook?.name} ${ch.number}:${v.number}`;
                    return (
                      <div
                        key={`${ch.number}-${v.number}`}
                        className="bible-verse"
                        onClick={() =>
                          setShareVerse({ text: v.text, number: v.number, reference: ref })
                        }
                        title="Clique para compartilhar"
                      >
                        <span className="bible-verse-num">{v.number}</span>
                        <span className="bible-verse-text">{v.text}</span>
                      </div>
                    );
                  })}
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
