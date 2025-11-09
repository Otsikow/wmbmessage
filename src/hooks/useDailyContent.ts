import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export interface DailyContent {
  id: string;
  bible_book: string;
  bible_chapter: number;
  bible_verse: number;
  sermon_paragraph_id: string;
  date_generated: string;
  created_at: string;
  sermon_paragraph?: {
    content: string;
    sermon: {
      title: string;
      date: string;
      location: string;
    };
  };
}

export interface DailyContentWithDetails extends DailyContent {
  bible_verse_text?: string;
}

export function useDailyContent() {
  const [dailyContent, setDailyContent] = useState<DailyContentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBibleVerseText = async (book: string, chapter: number, verse: number): Promise<string> => {
    try {
      const bookFormatted = book.replace(/\s+/g, "");
      const response = await fetch(
        `https://bible-api.com/${bookFormatted}${chapter}:${verse}?translation=kjv`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch Bible verse");
      }
      
      const data = await response.json();
      return data.text || data.verses?.[0]?.text || "";
    } catch (err) {
      console.error("Error fetching Bible verse:", err);
      return "";
    }
  };

  const fetchDailyContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Daily content is unavailable.");
      }

      // First, try to get today's content
      const today = new Date().toISOString().split('T')[0];

      const { data: initialData, error: fetchError } = await (supabase as any)
        .from('daily_content')
        .select(`
          *,
          sermon_paragraph:sermon_paragraphs (
            content,
            sermon:sermons (
              title,
              date,
              location
            )
          )
        `)
        .eq('date_generated', today)
        .single();

      let dailyData = initialData;

      // If no content exists for today, just return null (no auto-generation since RPC doesn't exist)
      if (!dailyData || fetchError) {
        setDailyContent(null);
        setLoading(false);
        return;
      }

      if (dailyData) {
        // Fetch the Bible verse text from the API
        const verseText = await fetchBibleVerseText(
          (dailyData as any).bible_book || (dailyData as any).verse_book,
          (dailyData as any).bible_chapter || (dailyData as any).verse_chapter,
          (dailyData as any).bible_verse || (dailyData as any).verse_verse
        );

        setDailyContent({
          ...(dailyData as any),
          bible_verse_text: verseText,
        });
      }
    } catch (err) {
      console.error("Error fetching daily content:", err);
      setError(err instanceof Error ? err.message : "Failed to load daily content");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Daily content is unavailable.");
      }

      // Delete old content for today
      const today = new Date().toISOString().split('T')[0];
      await (supabase as any)
        .from('daily_content')
        .delete()
        .eq('date_generated', today);

      // Refetch after deletion
      await fetchDailyContent();
    } catch (err) {
      console.error("Error refreshing daily content:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh daily content");
    } finally {
      setLoading(false);
    }
  }, [fetchDailyContent]);

  useEffect(() => {
    fetchDailyContent();
  }, [fetchDailyContent]);

  return {
    dailyContent,
    loading,
    error,
    refreshContent,
  };
}
