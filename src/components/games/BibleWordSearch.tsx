import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addManna } from "@/components/MannaTracker";

const GRID_SIZE = 8;
const BIBLE_WORDS = [
  "GRACE", "FAITH", "LOVE", "HOPE", "PEACE", "MERCY", "GLORY", "LIGHT",
  "TRUTH", "CROSS", "ALTAR", "ANGEL", "PSALM", "BREAD", "WATER", "SPIRIT",
  "CROWN", "SWORD", "FLAME", "STONE", "HEART", "BLOOD", "LAMB", "VINE",
];

type Direction = [number, number];
const DIRECTIONS: Direction[] = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];

interface PlacedWord {
  word: string;
  cells: [number, number][];
}

const generateGrid = (): { grid: string[][]; placed: PlacedWord[] } => {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placed: PlacedWord[] = [];
  const words = [...BIBLE_WORDS].sort(() => Math.random() - 0.5);

  for (const word of words) {
    if (placed.length >= 6) break;
    let success = false;
    for (let attempt = 0; attempt < 50 && !success; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const cells: [number, number][] = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dir[0] * i;
        const nc = c + dir[1] * i;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) { fits = false; break; }
        if (grid[nr][nc] !== "" && grid[nr][nc] !== word[i]) { fits = false; break; }
        cells.push([nr, nc]);
      }
      if (fits) {
        cells.forEach(([cr, cc], i) => { grid[cr][cc] = word[i]; });
        placed.push({ word, cells });
        success = true;
      }
    }
  }

  // Fill remaining cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }
  return { grid, placed };
};

const BibleWordSearch = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => { newGame(); }, []);

  const newGame = () => {
    const { grid, placed } = generateGrid();
    setGrid(grid);
    setPlacedWords(placed);
    setFoundWords(new Set());
    setSelectedCells([]);
    setFinished(false);
  };

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    placedWords.filter((pw) => foundWords.has(pw.word)).forEach((pw) => {
      pw.cells.forEach(([r, c]) => set.add(`${r}-${c}`));
    });
    return set;
  }, [foundWords, placedWords]);

  const handleCellClick = (r: number, c: number) => {
    if (finished) return;
    const newSelected = [...selectedCells, [r, c] as [number, number]];
    setSelectedCells(newSelected);

    const selectedStr = newSelected.map(([cr, cc]) => grid[cr][cc]).join("");
    const match = placedWords.find((pw) => !foundWords.has(pw.word) && pw.word === selectedStr);
    if (match) {
      const newFound = new Set([...foundWords, match.word]);
      setFoundWords(newFound);
      setSelectedCells([]);
      if (newFound.size === placedWords.length) {
        addManna(placedWords.length * 2);
        setFinished(true);
      }
    } else if (selectedStr.length >= 7) {
      setSelectedCells([]);
    }
  };

  const selectedSet = useMemo(
    () => new Set(selectedCells.map(([r, c]) => `${r}-${c}`)),
    [selectedCells]
  );

  if (grid.length === 0) return null;

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">All Words Found!</h3>
        <div className="flex items-center justify-center gap-1 mb-6">
          <Sparkles size={14} className="text-primary" />
          <span className="font-body text-sm text-primary">+{placedWords.length * 2} Manna earned!</span>
        </div>
        <Button onClick={newGame} className="gap-2 bg-primary text-primary-foreground">
          <RotateCcw size={16} /> New Puzzle
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">{foundWords.size} / {placedWords.length} words</span>
        <button onClick={() => setSelectedCells([])} className="text-xs text-primary font-body hover:underline">Clear selection</button>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-2xl p-2 mb-4 overflow-x-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r}-${c}`;
              const isFound = foundCells.has(key);
              const isSelected = selectedSet.has(key);
              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-display font-bold transition-all ${
                    isFound ? "bg-primary/20 text-primary" :
                    isSelected ? "bg-accent/20 text-accent scale-110" :
                    "bg-muted text-foreground hover:bg-primary/10"
                  }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Word list */}
      <div className="flex flex-wrap gap-2">
        {placedWords.map((pw) => (
          <span
            key={pw.word}
            className={`px-3 py-1 rounded-full text-xs font-body font-medium ${
              foundWords.has(pw.word)
                ? "bg-primary/15 text-primary line-through"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {pw.word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BibleWordSearch;
