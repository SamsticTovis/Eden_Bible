import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, X, Bookmark, Copy, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BookInfo {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
  testament: string;
}

interface ChapterVerse {
  number: string;
  text: string;
}

const DEFAULT_TRANSLATION = "BSB";

const FullBibleReader = () => {
  const [translation, setTranslation] = useState(DEFAULT_TRANSLATION);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<ChapterVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBooks, setShowBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("eden-bookmarks") || "[]"));
    } catch { return new Set(); }
  });
  const [activeTab, setActiveTab] = useState<"old" | "new">("old");

  // Fetch books
  useEffect(() => {
    fetch(`https://bible.helloao.org/api/${translation}/books.json`)
      .then((r) => r.json())
      .then((data) => {
        const bookList: BookInfo[] = (data || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          commonName: b.commonName || b.name,
          numberOfChapters: b.numberOfChapters,
          testament: b.testament || (["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL"].includes(b.id) ? "OT" : "NT"),
        }));
        setBooks(bookList);
      })
      .catch(() => {
        toast({ title: "Failed to load books", variant: "destructive" });
      });
  }, [translation]);

  // Fetch chapter
  const fetchChapter = useCallback(async (bookId: string, chap: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://bible.helloao.org/api/${translation}/${bookId}/${chap}.json`);
      const data = await res.json();
      const chapterData = data?.chapter;
      if (chapterData) {
        const parsed: ChapterVerse[] = Object.entries(chapterData.content || {})
          .filter(([key]) => !isNaN(Number(key)))
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([num, content]: [string, any]) => ({
            number: num,
            text: typeof content === "string" ? content : (content?.text || content?.heading || JSON.stringify(content)),
          }));
        setVerses(parsed);
      } else {
        setVerses([]);
      }
    } catch {
      toast({ title: "Failed to load chapter", variant: "destructive" });
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [translation]);

  const selectBook = (book: BookInfo) => {
    setSelectedBook(book);
    setChapter(1);
    setShowBooks(false);
    fetchChapter(book.id, 1);
  };

  const changeChapter = (dir: number) => {
    if (!selectedBook) return;
    const next = chapter + dir;
    if (next < 1 || next > selectedBook.numberOfChapters) return;
    setChapter(next);
    fetchChapter(selectedBook.id, next);
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
    toast({ title: "Copied! 📋", description: `${selectedBook?.commonName} ${chapter}:${verse.number}` });
  };

  const shareVerse = async (verse: ChapterVerse) => {
    const text = `"${verse.text}" — ${selectedBook?.commonName} ${chapter}:${verse.number} (${translation})`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!", description: text.slice(0, 60) + "..." });
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
        {showBooks ? (
          <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-display text-2xl text-center mb-1 text-foreground">Bible Reader</h2>
            <p className="text-center text-muted-foreground font-body mb-4 text-sm">Read God's Word 📖</p>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books..."
                className="pl-9 pr-9 bg-card border-border font-body text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Testament tabs */}
            <div className="flex gap-2 mb-4">
              {(["old", "new"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all ${
                    activeTab === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {t === "old" ? "Old Testament" : "New Testament"}
                </button>
              ))}
            </div>

            {/* Book grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredBooks.map((book, i) => (
                <motion.button
                  key={book.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  onClick={() => selectBook(book)}
                  className="p-3 rounded-xl bg-card border border-border text-left hover:border-primary/40 hover:shadow-soft transition-all active:scale-[0.98]"
                >
                  <p className="font-body text-sm font-medium text-foreground truncate">{book.commonName}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{book.numberOfChapters} chapters</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="reader" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setShowBooks(true)} className="text-primary font-body text-sm flex items-center gap-1">
                <ChevronLeft size={16} /> Books
              </button>
              <div className="flex-1 text-center">
                <p className="font-display text-base text-foreground">{selectedBook?.commonName} {chapter}</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">{translation}</p>
              </div>
              <select
                value={translation}
                onChange={(e) => {
                  setTranslation(e.target.value);
                  if (selectedBook) fetchChapter(selectedBook.id, chapter);
                }}
                className="bg-card border border-border rounded-lg px-2 py-1 font-body text-xs text-foreground"
              >
                {["BSB", "KJV", "WEB", "ASV"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Chapter nav */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeChapter(-1)}
                disabled={chapter <= 1}
                className="gap-1 font-body text-xs"
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="font-body text-sm text-muted-foreground">
                {chapter} / {selectedBook?.numberOfChapters}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeChapter(1)}
                disabled={chapter >= (selectedBook?.numberOfChapters || 1)}
                className="gap-1 font-body text-xs"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>

            {/* Verses */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
                {verses.map((verse) => {
                  const key = `${selectedBook?.id}-${chapter}-${verse.number}`;
                  const isBookmarked = bookmarkedVerses.has(key);
                  return (
                    <motion.div
                      key={verse.number}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group flex gap-2 py-2 px-1 rounded-lg hover:bg-card/80 transition-colors"
                    >
                      <span className="font-body text-xs text-primary font-bold mt-0.5 w-6 flex-shrink-0 text-right">
                        {verse.number}
                      </span>
                      <div className="flex-1">
                        <p className="font-body text-foreground leading-relaxed text-[15px]">{verse.text}</p>
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleBookmark(key)} className="p-1 rounded">
                            <Bookmark size={12} className={isBookmarked ? "text-primary fill-primary" : "text-muted-foreground"} />
                          </button>
                          <button onClick={() => copyVerse(verse)} className="p-1 rounded">
                            <Copy size={12} className="text-muted-foreground" />
                          </button>
                          <button onClick={() => shareVerse(verse)} className="p-1 rounded">
                            <Share2 size={12} className="text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
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
