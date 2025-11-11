import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface LibraryBookmark {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  note?: string | null;
  created_at: string;
}

export interface LibraryHighlight extends LibraryBookmark {
  color: string;
  updated_at?: string | null;
}

type StoredBookmark = Omit<LibraryBookmark, "book" | "chapter" | "verse"> & {
  book?: string;
  chapter?: number;
  verse?: number;
};

type StoredHighlight = Omit<LibraryHighlight, "book" | "chapter" | "verse"> & {
  book?: string;
  chapter?: number;
  verse?: number;
};

const SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const getLocalStorageKey = (type: "bookmarks" | "highlights", book: string, chapter: number) =>
  `reader:${type}:${book}:${chapter}`;

const safeParseJSON = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse library storage entry", error);
    return null;
  }
};

const collectLocalItems = <T extends StoredBookmark | StoredHighlight>(
  type: "bookmarks" | "highlights"
): (T & { book: string; chapter: number; verse: number })[] => {
  if (typeof window === "undefined") return [];

  const items: (T & { book: string; chapter: number; verse: number })[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(`reader:${type}:`)) continue;

    const [, , book, chapterString] = key.split(":");
    if (!book || !chapterString) continue;

    const chapter = Number.parseInt(chapterString, 10);
    if (Number.isNaN(chapter)) continue;

    const stored = safeParseJSON<T[]>(window.localStorage.getItem(key));
    if (!stored) continue;

    stored.forEach((entry) => {
      if (typeof entry.verse !== "number") return;
      items.push({
        ...entry,
        book,
        chapter,
        verse: entry.verse,
      } as T & { book: string; chapter: number; verse: number });
    });
  }

  items.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (dateA === dateB) {
      if (a.book === b.book) {
        if (a.chapter === b.chapter) {
          return a.verse - b.verse;
        }
        return a.chapter - b.chapter;
      }
      return a.book.localeCompare(b.book);
    }

    return dateB - dateA;
  });

  return items;
};

export function useLibraryItems() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);
  const [highlights, setHighlights] = useState<LibraryHighlight[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  const canUseSupabase = useMemo(() => SUPABASE_CONFIGURED && Boolean(user), [user]);

  const fetchBookmarks = useCallback(async () => {
    if (!canUseSupabase) {
      setBookmarks(collectLocalItems<StoredBookmark>("bookmarks"));
      setBookmarksLoading(false);
      return;
    }

    setBookmarksLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_bookmarks")
        .select("id, user_id, book, chapter, verse, note, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookmarks((data || []) as LibraryBookmark[]);
    } catch (error) {
      console.error("Failed to load bookmarks", error);
      toast({
        title: "Error",
        description: "We couldn't load your bookmarks right now.",
        variant: "destructive",
      });
    } finally {
      setBookmarksLoading(false);
    }
  }, [canUseSupabase, toast, user]);

  const fetchHighlights = useCallback(async () => {
    if (!canUseSupabase) {
      setHighlights(collectLocalItems<StoredHighlight>("highlights"));
      setHighlightsLoading(false);
      return;
    }

    setHighlightsLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_highlights")
        .select("id, user_id, book, chapter, verse, color, note, created_at, updated_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHighlights((data || []) as LibraryHighlight[]);
    } catch (error) {
      console.error("Failed to load highlights", error);
      toast({
        title: "Error",
        description: "We couldn't load your highlights right now.",
        variant: "destructive",
      });
    } finally {
      setHighlightsLoading(false);
    }
  }, [canUseSupabase, toast, user]);

  useEffect(() => {
    fetchBookmarks();
    fetchHighlights();
  }, [fetchBookmarks, fetchHighlights]);

  const removeLocalItem = useCallback(
    (
      type: "bookmarks" | "highlights",
      item: Pick<LibraryBookmark, "book" | "chapter" | "verse">
    ) => {
      if (typeof window === "undefined") return;
      const key = getLocalStorageKey(type, item.book, item.chapter);
      const stored = safeParseJSON<(StoredBookmark | StoredHighlight)[]>(
        window.localStorage.getItem(key)
      );

      if (!stored) return;

      const next = stored.filter((entry) => entry.verse !== item.verse);
      if (next.length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(next));
      }
    },
    []
  );

  const updateLocalHighlight = useCallback(
    (highlight: LibraryHighlight, updates: Partial<StoredHighlight>) => {
      if (typeof window === "undefined") return;
      const key = getLocalStorageKey("highlights", highlight.book, highlight.chapter);
      const stored = safeParseJSON<StoredHighlight[]>(window.localStorage.getItem(key));

      if (!stored) return;

      const next = stored.map((entry) =>
        entry.verse === highlight.verse
          ? { ...entry, ...updates }
          : entry
      );

      window.localStorage.setItem(key, JSON.stringify(next));
    },
    []
  );

  const removeBookmark = useCallback(
    async (bookmark: LibraryBookmark): Promise<boolean> => {
      if (!canUseSupabase) {
        removeLocalItem("bookmarks", bookmark);
        setBookmarks((prev) => prev.filter((item) => item.verse !== bookmark.verse));
        toast({ title: "Bookmark removed", description: "Removed from your library." });
        return true;
      }

      try {
        const { error } = await supabase
          .from("user_bookmarks")
          .delete()
          .eq("id", bookmark.id)
          .eq("user_id", user!.id);

        if (error) throw error;

        setBookmarks((prev) => prev.filter((item) => item.id !== bookmark.id));
        toast({ title: "Bookmark removed", description: "Removed from your library." });
        return true;
      } catch (error) {
        console.error("Failed to delete bookmark", error);
        toast({
          title: "Error",
          description: "We couldn't remove that bookmark.",
          variant: "destructive",
        });
        return false;
      }
    },
    [canUseSupabase, removeLocalItem, toast, user]
  );

  const removeHighlight = useCallback(
    async (highlight: LibraryHighlight): Promise<boolean> => {
      if (!canUseSupabase) {
        removeLocalItem("highlights", highlight);
        setHighlights((prev) => prev.filter((item) => item.verse !== highlight.verse));
        toast({ title: "Highlight removed", description: "Removed from your library." });
        return true;
      }

      try {
        const { error } = await supabase
          .from("user_highlights")
          .delete()
          .eq("id", highlight.id)
          .eq("user_id", user!.id);

        if (error) throw error;

        setHighlights((prev) => prev.filter((item) => item.id !== highlight.id));
        toast({ title: "Highlight removed", description: "Removed from your library." });
        return true;
      } catch (error) {
        console.error("Failed to delete highlight", error);
        toast({
          title: "Error",
          description: "We couldn't remove that highlight.",
          variant: "destructive",
        });
        return false;
      }
    },
    [canUseSupabase, removeLocalItem, toast, user]
  );

  const updateHighlight = useCallback(
    async (
      highlight: LibraryHighlight,
      updates: { note?: string | null }
    ): Promise<boolean> => {
      const nextNote = updates.note ?? null;

      if (!canUseSupabase) {
        const timestamp = new Date().toISOString();
        setHighlights((prev) =>
          prev.map((item) =>
            item.book === highlight.book &&
            item.chapter === highlight.chapter &&
            item.verse === highlight.verse
              ? { ...item, note: nextNote, updated_at: timestamp }
              : item
          )
        );
        updateLocalHighlight(highlight, { note: nextNote, updated_at: timestamp });
        toast({ title: "Highlight updated", description: "Your highlight note was saved." });
        return true;
      }

      try {
        const { data, error } = await supabase
          .from("user_highlights")
          .update({ note: nextNote })
          .eq("id", highlight.id)
          .eq("user_id", user!.id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setHighlights((prev) =>
            prev.map((item) => (item.id === highlight.id ? (data as LibraryHighlight) : item))
          );
        }

        toast({ title: "Highlight updated", description: "Your highlight note was saved." });
        return true;
      } catch (error) {
        console.error("Failed to update highlight", error);
        toast({
          title: "Error",
          description: "We couldn't update that highlight.",
          variant: "destructive",
        });
        return false;
      }
    },
    [canUseSupabase, toast, updateLocalHighlight, user]
  );

  const refetch = useCallback(() => {
    fetchBookmarks();
    fetchHighlights();
  }, [fetchBookmarks, fetchHighlights]);

  return {
    bookmarks,
    highlights,
    bookmarksLoading,
    highlightsLoading,
    removeBookmark,
    removeHighlight,
    updateHighlight,
    refetch,
  };
}
