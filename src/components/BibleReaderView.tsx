import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface BibleReaderViewProps {
  book: string;
  chapter: number;
  translation: string;
  onChapterChange: (book: string, chapter: number) => void;
  onEdenMessage: (msg: string) => void;
}

interface ChapterData {
  book: { name: string };
  chapter: { number: number };
  verses: Record<string, { text: string }>;
  next?: { bookId: string; number: number };
  previous?: { bookId: string; number: number };
}

const bookNameMap: Record<string, string> = {
  genesis: "GEN", gen: "GEN",
  exodus: "EXO", exo: "EXO",
  leviticus: "LEV", lev: "LEV",
  numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deu: "DEU",
  joshua: "JOS", jos: "JOS",
  judges: "JDG", jdg: "JDG",
  ruth: "RUT", rut: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1sa": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2sa": "2SA", "2 sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1ki": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2ki": "2KI",
  "1 chronicles": "1CH", "1chronicles": "1CH",
  "2 chronicles": "2CH", "2chronicles": "2CH",
  ezra: "EZR", nehemiah: "NEH", esther: "EST", job: "JOB",
  psalms: "PSA", psalm: "PSA", psa: "PSA", ps: "PSA",
  proverbs: "PRO", pro: "PRO", prov: "PRO",
  ecclesiastes: "ECC", ecc: "ECC",
  "song of solomon": "SNG", songs: "SNG", sng: "SNG",
  isaiah: "ISA", isa: "ISA",
  jeremiah: "JER", jer: "JER",
  lamentations: "LAM", lam: "LAM",
  ezekiel: "EZK", ezk: "EZK",
  daniel: "DAN", dan: "DAN",
  hosea: "HOS", hos: "HOS",
  joel: "JOL", jol: "JOL",
  amos: "AMO", amo: "AMO",
  obadiah: "OBA", oba: "OBA",
  jonah: "JON", jon: "JON",
  micah: "MIC", mic: "MIC",
  nahum: "NAM", nam: "NAM",
  habakkuk: "HAB", hab: "HAB",
  zephaniah: "ZEP", zep: "ZEP",
  haggai: "HAG", hag: "HAG",
  zechariah: "ZEC", zec: "ZEC",
  malachi: "MAL", mal: "MAL",
  matthew: "MAT", mat: "MAT", matt: "MAT",
  mark: "MRK", mrk: "MRK",
  luke: "LUK", luk: "LUK",
  john: "JHN", jhn: "JHN", joh: "JHN",
  acts: "ACT", act: "ACT",
  romans: "ROM", rom: "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO", "1co": "1CO", "1 cor": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO", "2co": "2CO", "2 cor": "2CO",
  galatians: "GAL", gal: "GAL",
  ephesians: "EPH", eph: "EPH",
  philippians: "PHP", php: "PHP", phil: "PHP",
  colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1th": "1TH",
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2th": "2TH",
  "1 timothy": "1TI", "1timothy": "1TI", "1ti": "1TI",
  "2 timothy": "2TI", "2timothy": "2TI", "2ti": "2TI",
  titus: "TIT", tit: "TIT",
  philemon: "PHM", phm: "PHM",
  hebrews: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "1peter": "1PE", "1pe": "1PE",
  "2 peter": "2PE", "2peter": "2PE", "2pe": "2PE",
  "1 john": "1JN", "1john": "1JN", "1jn": "1JN",
  "2 john": "2JN", "2john": "2JN", "2jn": "2JN",
  "3 john": "3JN", "3john": "3JN", "3jn": "3JN",
  jude: "JUD", jud: "JUD",
  revelation: "REV", rev: "REV", revelations: "REV",
};

const resolveBookId = (input: string): string => {
  const lower = input.toLowerCase().trim();
  return bookNameMap[lower] || input.toUpperCase().substring(0, 3);
};

const BibleReaderView = ({ book, chapter, translation, onChapterChange, onEdenMessage }: BibleReaderViewProps) => {
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadChapter(); }, [book, chapter, translation]);

  const loadChapter = async () => {
    setLoading(true); setError(null);
    const bookId = resolveBookId(book);
    try {
      const res = await fetch(`https://bible.helloao.org/api/${translation}/${bookId}/${chapter}.json`);
      if (!res.ok) throw new Error("Chapter not found");
      const json = await res.json();
      setData(json);
      onEdenMessage(`📖 Reading ${json.book?.name || book} ${chapter}. Enjoy!`);
    } catch {
      setError("Couldn't load that chapter. Check the book name and try again!");
      onEdenMessage("Hmm, I couldn't find that chapter. Try 'Genesis 1' or 'Psalm 23' 🤔");
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-primary" size={24} />
    </div>
  );

  if (error) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
      <p className="text-2xl mb-2">🤷</p>
      <p className="text-muted-foreground font-body text-sm">{error}</p>
    </motion.div>
  );

  if (!data) return null;

  const verses = Object.entries(data.verses || {}).sort(([a], [b]) => parseInt(a) - parseInt(b));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-4">
        <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
          {data.book?.name || book} {data.chapter?.number || chapter}
        </h2>
        <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
          {translation.toUpperCase()}
        </span>
      </div>

      <div className="glass rounded-2xl p-5 shadow-soft mb-4 max-h-[50vh] overflow-y-auto">
        {verses.map(([num, verse]) => (
          <p key={num} className="font-body text-foreground/85 leading-[1.8] mb-1.5 text-[14px]">
            <span className="text-primary/60 font-semibold text-[11px] align-super mr-1">{num}</span>
            {typeof verse === "object" && verse.text ? verse.text : String(verse)}
          </p>
        ))}
      </div>

      <div className="flex gap-2.5">
        {data.previous && (
          <button
            onClick={() => onChapterChange(data.previous!.bookId, data.previous!.number)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass text-foreground/80 font-medium text-sm hover:bg-muted/50 transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>
        )}
        {data.next && (
          <button
            onClick={() => onChapterChange(data.next!.bookId, data.next!.number)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/15 text-primary font-medium text-sm hover:bg-primary/25 transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BibleReaderView;
