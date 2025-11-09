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

      const { data: initialData, error: fetchError } = await supabase
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

      // If no content exists for today, generate it
      if (!dailyData || fetchError) {
        const { data: generated, error: generateError } = await supabase
          .rpc('generate_daily_content');

        if (generateError) {
          throw generateError;
        }

        // Fetch the newly generated content with details
        const { data: newData, error: newFetchError } = await supabase
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
          .eq('id', generated.id)
          .single();

        if (newFetchError) {
          throw newFetchError;
        }

        dailyData = newData;
      }

      if (dailyData) {
        // Fetch the Bible verse text from the API
        const verseText = await fetchBibleVerseText(
          dailyData.bible_book,
          dailyData.bible_chapter,
          dailyData.bible_verse
        );

        setDailyContent({
          ...dailyData,
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

      // Generate new random content
      const { data: generated, error: generateError } = await supabase
        .rpc('generate_daily_content');

      if (generateError) {
        throw generateError;
      }

      // Delete old content for today and insert the new one
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_content')
        .delete()
        .eq('date_generated', today);

      // Call generate again to create fresh content
      const { data: newGenerated, error: newGenerateError } = await supabase
        .rpc('generate_daily_content');

      if (newGenerateError) {
        throw newGenerateError;
      }

      // Fetch the newly generated content with details
      const { data: newData, error: newFetchError } = await supabase
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
        .eq('id', newGenerated.id)
        .single();

      if (newFetchError) {
        throw newFetchError;
      }

      if (newData) {
        // Fetch the Bible verse text from the API
        const verseText = await fetchBibleVerseText(
          newData.bible_book,
          newData.bible_chapter,
          newData.bible_verse
        );

        setDailyContent({
          ...newData,
          bible_verse_text: verseText,
        });
      }
    } catch (err) {
      console.error("Error refreshing daily content:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh daily content");
    } finally {
      setLoading(false);
    }
  }, []);

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
