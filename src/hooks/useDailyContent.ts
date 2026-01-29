import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyContent {
  id: string;
  content_date: string;
  verse_book: string;
  verse_chapter: number;
  verse_verse: number;
  verse_text: string;
  quote_text: string | null;
  quote_source: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DailyContentWithDetails extends DailyContent {
  bible_verse_text?: string;
}

export function useDailyContent() {
  const [dailyContent, setDailyContent] = useState<DailyContentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('daily_content')
        .select('*')
        .eq('content_date', today)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching daily content:", fetchError);
        setDailyContent(null);
        setLoading(false);
        return;
      }

      if (data) {
        setDailyContent({
          ...data,
          bible_verse_text: data.verse_text,
        });
      } else {
        // No content for today, try to get the most recent content
        const { data: recentData, error: recentError } = await supabase
          .from('daily_content')
          .select('*')
          .order('content_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentData && !recentError) {
          setDailyContent({
            ...recentData,
            bible_verse_text: recentData.verse_text,
          });
        } else {
          setDailyContent(null);
        }
      }
    } catch (err) {
      console.error("Error fetching daily content:", err);
      setError(err instanceof Error ? err.message : "Failed to load daily content");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContent = useCallback(async () => {
    await fetchDailyContent();
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
