import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Highlight {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  sermon_id: string;
  paragraph_number: number;
  note?: string;
  created_at: string;
}

export const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "yellow", class: "bg-yellow-200/60 dark:bg-yellow-900/30" },
  { name: "Green", value: "green", class: "bg-green-200/60 dark:bg-green-900/30" },
  { name: "Blue", value: "blue", class: "bg-blue-200/60 dark:bg-blue-900/30" },
  { name: "Pink", value: "pink", class: "bg-pink-200/60 dark:bg-pink-900/30" },
  { name: "Purple", value: "purple", class: "bg-purple-200/60 dark:bg-purple-900/30" },
  { name: "Orange", value: "orange", class: "bg-orange-200/60 dark:bg-orange-900/30" },
];

export function getHighlightColorClass(color: string): string {
  return HIGHLIGHT_COLORS.find(c => c.value === color)?.class || HIGHLIGHT_COLORS[0].class;
}

export function useHighlights(book: string, chapter: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const fallbackNotifiedRef = useRef(false);
  const errorNotifiedRef = useRef(false);

  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  const canUseSupabase = Boolean(isSupabaseConfigured && user);

  const getLocalStorageKey = (type: "highlights" | "bookmarks") =>
    `reader:${type}:${book}:${chapter}`;

  const readLocalStorage = <T,>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : null;
    } catch (error) {
      console.warn("Failed to parse reader storage", error);
      return null;
    }
  };

  const writeLocalStorage = <T,>(key: string, value: T) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to persist reader storage", error);
    }
  };

  const loadLocalHighlights = () =>
    readLocalStorage<Highlight[]>(getLocalStorageKey("highlights")) || [];

  const loadLocalBookmarks = () =>
    readLocalStorage<Bookmark[]>(getLocalStorageKey("bookmarks")) || [];

  const persistLocalHighlights = (data: Highlight[]) =>
    writeLocalStorage(getLocalStorageKey("highlights"), data);

  const persistLocalBookmarks = (data: Bookmark[]) =>
    writeLocalStorage(getLocalStorageKey("bookmarks"), data);

  const generateId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Fetch highlights and bookmarks for current chapter
  useEffect(() => {
    fetchHighlightsAndBookmarks();
  }, [user?.id, book, chapter, canUseSupabase]);

  const fetchHighlightsAndBookmarks = async () => {
    setLoading(true);

    if (!canUseSupabase) {
      const localHighlights = loadLocalHighlights();
      const localBookmarks = loadLocalBookmarks();
      setHighlights(localHighlights);
      setBookmarks(localBookmarks);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [highlightsResult, bookmarksResult] = await Promise.all([
        supabase
          .from("user_highlights")
          .select("*")
          .eq("user_id", user.id)
          .eq("book", book)
          .eq("chapter", chapter),
        // Note: user_bookmarks are for sermons, not Bible verses
        Promise.resolve({ data: [], error: null }),
      ]);

      if (highlightsResult.error) throw highlightsResult.error;
      if (bookmarksResult.error) throw bookmarksResult.error;

      setHighlights(highlightsResult.data || []);
      setBookmarks([]);
      fallbackNotifiedRef.current = false;
      errorNotifiedRef.current = false;
    } catch (error) {
      console.error("Error fetching highlights/bookmarks:", error);
      const localHighlights = loadLocalHighlights();
      const localBookmarks = loadLocalBookmarks();
      setHighlights(localHighlights);
      setBookmarks(localBookmarks);

      const hasLocalData = localHighlights.length > 0 || localBookmarks.length > 0;

      if (hasLocalData) {
        if (!fallbackNotifiedRef.current) {
          toast({
            title: "Offline data restored",
            description: "Showing saved highlights and bookmarks from this device.",
          });
          fallbackNotifiedRef.current = true;
        }
      } else if (!errorNotifiedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load highlights and bookmarks.",
          variant: "destructive",
        });
        errorNotifiedRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = async (verse: number, color: string, note?: string): Promise<boolean> => {
    if (!canUseSupabase) {
      const now = new Date().toISOString();
      setHighlights((prev) => {
        const existing = prev.find((h) => h.verse === verse);
        const updatedHighlight: Highlight = existing
          ? {
              ...existing,
              color,
              note,
              updated_at: now,
            }
          : {
              id: generateId(),
              user_id: user?.id || "local",
              book,
              chapter,
              verse,
              color,
              note,
              created_at: now,
              updated_at: now,
            };

        const filtered = prev.filter((h) => h.verse !== verse);
        const next = [...filtered, updatedHighlight].sort((a, b) => a.verse - b.verse);
        persistLocalHighlights(next);
        return next;
      });

      toast({
        title: "Highlight added",
        description: `${book} ${chapter}:${verse} has been highlighted.`,
      });

      return true;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to highlight verses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("user_highlights")
        .upsert(
          {
            user_id: user.id,
            book,
            chapter,
            verse,
            color,
            note,
          },
          { onConflict: "user_id,book,chapter,verse" }
        )
        .select()
        .single();

      if (error) throw error;

      setHighlights((prev) => {
        const filtered = prev.filter((h) => h.verse !== verse);
        return [...filtered, data];
      });

      toast({
        title: "Highlight added",
        description: `${book} ${chapter}:${verse} has been highlighted.`,
      });

      return true;
    } catch (error) {
      console.error("Error adding highlight:", error);
      toast({
        title: "Error",
        description: "Failed to add highlight.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeHighlight = async (verse: number): Promise<boolean> => {
    if (!canUseSupabase) {
      setHighlights((prev) => {
        const next = prev.filter((h) => h.verse !== verse);
        persistLocalHighlights(next);
        return next;
      });

      toast({
        title: "Highlight removed",
        description: `Removed highlight from ${book} ${chapter}:${verse}.`,
      });

      return true;
    }

    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_highlights")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);

      if (error) throw error;

      setHighlights((prev) => prev.filter((h) => h.verse !== verse));

      toast({
        title: "Highlight removed",
        description: `Removed highlight from ${book} ${chapter}:${verse}.`,
      });
      return true;
    } catch (error) {
      console.error("Error removing highlight:", error);
      toast({
        title: "Error",
        description: "Failed to remove highlight.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleBookmark = async (verse: number, note?: string): Promise<boolean> => {
    // Note: Bookmarking is disabled for Bible verses
    // user_bookmarks table is designed for sermon bookmarks only
    toast({
      title: "Feature unavailable",
      description: "Bible verse bookmarking will be available in a future update.",
    });
    return false;
  };

  const getVerseHighlight = (verse: number): Highlight | undefined =>
    highlights.find((h) => h.verse === verse);

  const isVerseBookmarked = (verse: number): boolean =>
    bookmarks.some((b) => b.verse === verse);

  return {
    highlights,
    bookmarks,
    loading,
    addHighlight,
    removeHighlight,
    toggleBookmark,
    getVerseHighlight,
    isVerseBookmarked,
    refetch: fetchHighlightsAndBookmarks,
  };
}
