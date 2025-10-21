import { useState, useEffect } from "react";

export interface RecentVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  timestamp: number;
}

const MAX_RECENT_VERSES = 10;
const STORAGE_KEY = "recent-bible-verses";

export function useRecentVerses() {
  const [recentVerses, setRecentVerses] = useState<RecentVerse[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentVerses));
  }, [recentVerses]);

  const addRecentVerse = (verse: Omit<RecentVerse, "id" | "timestamp">) => {
    const newVerse: RecentVerse = {
      ...verse,
      id: `${verse.book}-${verse.chapter}-${verse.verse}`,
      timestamp: Date.now(),
    };

    setRecentVerses((prev) => {
      const filtered = prev.filter((v) => v.id !== newVerse.id);
      const updated = [newVerse, ...filtered].slice(0, MAX_RECENT_VERSES);
      return updated;
    });
  };

  const clearRecentVerses = () => {
    setRecentVerses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentVerses, addRecentVerse, clearRecentVerses };
}
