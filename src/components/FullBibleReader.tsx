import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, X, Bookmark, Copy, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/useStreak";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { useAchievements } from "@/hooks/useAchievements";

interface BookInfo {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
  testament: string;
}

interface ChapterVerse {
  number: number;
  text: string;
}

interface ContentItem {
  type: string;
  number?: number;
  content?: (string | { text?: string; noteId?: number; lineBreak?: boolean; poem?: number })[];
}

const API_BASE = "https://bible.helloao.org/api";

const TRANSLATIONS: { label: string; apiId: string }[] = [
  { label: "BSB", apiId: "BSB" },
  { label: "KJV", apiId: "eng-kjv" },
  { label: "WEB", apiId: "eng-web" },
  { label: "ASV", apiId: "eng-asv" },
];

function getApiId(label: string): string {
  return TRANSLATIONS.find((t) => t.label === label)?.apiId || label;
}

const OT_BOOKS = new Set([
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI",
  "1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER",
  "LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP",
  "HAG","ZEC","MAL"
]);

function extractVerseText(content: ContentItem["content"]): string {
  if (!content) return "";
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        if (item.text) return item.text;
        if (item.lineBreak) return " ";
      }
      return "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

const FullBibleReader = () => {
  const { recordActivity } = useStreak();
  const { logActivity } = useActivityLogger();
  const { tryUnlock } = useAchievements();
  const [translation, setTranslation] = useState(() => localStorage.getItem("eden-version") || "BSB");
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<ChapterVerse[]>([]);
  const [headings, setHeadings] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [view, setView] = useState<"books" | "chapters" | "reader">("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("eden-bookmarks") || "[]")); }
    catch { return new Set(); }
  });
  const [activeTab, setActiveTab] = useState<"old" | "new">("old");

  useEffect(() => {
    setBooksLoading(true);
    fetch(`${API_BASE}/${getApiId(translation)}/books.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const rawBooks = Array.isArray(data) ? data : data?.books || [];
        const bookList: BookInfo[] = rawBooks.map((b: any) => ({
          id: b.id,
          name: b.name,
          commonName: b.commonName || b.name,
          numberOfChapters: b.numberOfChapters,
          testament: b.testament || (OT_BOOKS.has(b.id) ? "OT" : "NT"),
        }));
        setBooks(bookList);
      })
      .catch((err) => {
        console.error("Failed to load books:", err);
        toast({ title: "Failed to load books", description: "Check your connection and try again.", variant: "destructive" });
      })
      .finally(() => setBooksLoading(false));
  }, [translation]);

  const fetchChapter = useCallback(async (bookId: string, chap: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${getApiId(translation)}/${bookId}/${chap}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const contentArray: ContentItem[] = data?.chapter?.content || [];
      const parsedVerses: ChapterVerse[] = [];
      const parsedHeadings = new Map<number, string>();
      let lastHeading = "";

      for (const item of contentArray) {
        if (item.type === "heading" && item.content) {
          lastHeading = item.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("");
        }
        if (item.type === "verse" && item.number != null) {
          if (lastHeading) {
            parsedHeadings.set(item.number, lastHeading);
            lastHeading = "";
          }
          parsedVerses.push({
            number: item.number,
            text: extractVerseText(item.content),
          });
        }
      }

      setVerses(parsedVerses);
      setHeadings(parsedHeadings);
    } catch (err) {
      console.error("Failed to load chapter:", err);
      toast({ title: "Failed to load chapter", variant: "destructive" });
      setVerses([]);
      setHeadings(new Map());
    } finally {
      setLoading(false);
    }
  }, [translation]);

  const selectBook = (book: BookInfo) => {
    setSelectedBook(book);
    setView("chapters");
  };

  const selectChapter = async (chap: number) => {
    setChapter(chap);
    setView("reader");
    fetchChapter(selectedBook!.id, chap);
    recordActivity();
    await logActivity("read", `Read ${selectedBook!.commonName} ${chap}`, "BookOpen");
    tryUnlock("first_chapter");
  };

  const changeChapter = (dir: number) => {
    if (!selectedBook) return;
    const next = chapter + dir;
    if (next < 1 || next > selectedBook.numberOfChapters) return;
    setChapter(next);
    fetchChapter(selectedBook.id, next);
  };

  const handleTranslationChange = (newT: string) => {
    setTranslation(newT);
    localStorage.setItem("eden-version", newT);
    if (view === "reader" && selectedBook) {
      fetchChapter(selectedBook.id, chapter);
    }
  };

  const toggleBookmark = (verseKey: string) => {
    setBookmarkedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseKey)) next.delete(verseKey); else next.add(verseKey);
      localStorage.setItem("eden-bookmarks", JSON.stringify([...next]));
      return next;
    });
  };

  const copyVerse = (verse: ChapterVerse) => {
    const text = `"${verse.text}" — ${selectedBook?.commonName} ${chapter}:${verse.number} (${translation})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied! 📋" });
  };

  const shareVerse = async (verse: ChapterVerse) => {
    const text = `"${verse.text}" — ${selectedBook?.commonName} ${chapter}:${verse.number} (${translation})`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");
  const displayBooks = activeTab === "old" ? otBooks : ntBooks;
  const filteredBooks = searchQuery
    ? displayBooks.filter((b) => b.commonName.toLowerCase().includes(searchQuery.toLowerCase()))
    : displayBooks;

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {view === "books" && (
          <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-display text-2xl text-center mb-1 text-foreground">Bible Reader</h2>
            <p className="text-center text-muted-foreground font-body mb-4 text-sm">Read God's Word 📖</p>

            {/* Translation selector */}
            <div className="flex items-center justify-center gap-1.5 mb-3">
              {TRANSLATIONS.map((v) => (
                <button
                  key={v.label}
                  onClick={() => handleTranslationChange(v.label)}
                  className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${
                    translation === v.label ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books..."
                className="pl-9 pr-9 bg-card border-border font-body text-sm rounded-xl"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Testament tabs */}
            <div className="flex gap-1.5 mb-4">
              {(["old", "new"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                    activeTab === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "old" ? "Old Testament" : "New Testament"}
                </button>
              ))}
            </div>

            {/* Book grid */}
            {booksLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {filteredBooks.length === 0 && (
                  <p className="col-span-2 text-center text-muted-foreground font-body text-sm py-8">No books found</p>
                )}
                {filteredBooks.map((book, i) => (
                  <motion.button
                    key={book.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }}
                    onClick={() => selectBook(book)}
                    className="p-3 rounded-xl bg-card border border-border text-left hover:border-primary/30 hover:shadow-soft transition-all active:scale-[0.98]"
                  >
                    <p className="font-body text-sm font-medium text-foreground truncate">{book.commonName}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">{book.numberOfChapters} ch.</p>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === "chapters" && selectedBook && (
          <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setView("books")} className="text-primary font-body text-sm flex items-center gap-1 mb-3 hover:underline">
              <ChevronLeft size={16} /> Books
            </button>
            <h2 className="font-display text-xl text-foreground mb-1">{selectedBook.commonName}</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Select a chapter</p>
            <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto">
              {Array.from({ length: selectedBook.numberOfChapters }, (_, i) => i + 1).map((ch) => (
                <motion.button
                  key={ch}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(ch * 0.01, 0.5) }}
                  onClick={() => selectChapter(ch)}
                  className="aspect-square flex items-center justify-center rounded-xl bg-card border border-border font-body text-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
                >
                  {ch}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {view === "reader" && selectedBook && (
          <motion.div key="reader" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setView("chapters")} className="text-primary font-body text-sm flex items-center gap-1 hover:underline">
                <ChevronLeft size={16} /> Ch.
              </button>
              <div className="flex-1 text-center">
                <p className="font-display text-base text-foreground">{selectedBook.commonName} {chapter}</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{translation}</p>
              </div>
              <select
                value={translation}
                onChange={(e) => handleTranslationChange(e.target.value)}
                className="bg-card border border-border rounded-lg px-2 py-1 font-body text-xs text-foreground"
              >
                {TRANSLATIONS.map((v) => (
                  <option key={v.label} value={v.label}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Chapter nav */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={() => changeChapter(-1)} disabled={chapter <= 1} className="gap-1 font-body text-xs rounded-xl">
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="font-body text-xs text-muted-foreground">{chapter} / {selectedBook.numberOfChapters}</span>
              <Button variant="outline" size="sm" onClick={() => changeChapter(1)} disabled={chapter >= selectedBook.numberOfChapters} className="gap-1 font-body text-xs rounded-xl">
                Next <ChevronRight size={14} />
              </Button>
            </div>

            {/* Verses */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : verses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-body text-sm">No verses found for this chapter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto pr-1">
                {verses.map((verse) => {
                  const key = `${selectedBook.id}-${chapter}-${verse.number}`;
                  const isBookmarked = bookmarkedVerses.has(key);
                  const heading = headings.get(verse.number);
                  return (
                    <div key={verse.number}>
                      {heading && (
                        <h3 className="font-display text-sm text-primary mt-5 mb-2 px-1">
                          {heading}
                        </h3>
                      )}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group flex gap-2 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-body text-xs text-primary/70 font-semibold mt-0.5 w-6 flex-shrink-0 text-right">
                          {verse.number}
                        </span>
                        <div className="flex-1">
                          <p className="font-body text-foreground leading-[1.75] text-[15px]">{verse.text}</p>
                          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleBookmark(key)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <Bookmark size={12} className={isBookmarked ? "text-primary fill-primary" : "text-muted-foreground"} />
                            </button>
                            <button onClick={() => copyVerse(verse)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <Copy size={12} className="text-muted-foreground" />
                            </button>
                            <button onClick={() => shareVerse(verse)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <Share2 size={12} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullBibleReader;
