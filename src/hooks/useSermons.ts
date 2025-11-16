import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { loadSampleSermons, SampleSermonRecord, ensureSampleSermonDate } from "@/utils/sampleSermons";

export type Sermon = Tables<"sermons">;
export type SermonParagraph = Tables<"sermon_paragraphs">;

export interface SermonWithParagraphs extends Sermon {
  paragraphs?: SermonParagraph[];
}

export interface SearchResult {
  sermon_id: string;
  sermon_title: string;
  sermon_date: string;
  sermon_location: string;
  paragraph_number: number;
  content: string;
  relevance: number;
}

export function useSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSermons = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured) {
        const sampleData = await loadSampleSermonData();
        setSermons(sampleData.map(({ paragraphs, ...rest }) => rest));
        return;
      }

      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        const sampleData = await loadSampleSermonData();
        setSermons(sampleData.map(({ paragraphs, ...rest }) => rest));
        return;
      }

      setSermons(data || []);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      if (isSupabaseConfigured) {
        toast({
          title: "Error",
          description: "Failed to load sermons",
          variant: "destructive",
        });
      }
      const sampleData = await loadSampleSermonData();
      setSermons(sampleData.map(({ paragraphs, ...rest }) => rest));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermonWithParagraphs = async (
    sermonId: string
  ): Promise<SermonWithParagraphs | null> => {
    if (!isSupabaseConfigured) {
      const sampleData = await loadSampleSermonData();
      return sampleData.find((sermon) => sermon.id === sermonId) || null;
    }

    try {
      const { data: sermon, error: sermonError } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", sermonId)
        .single();

      if (sermonError) throw sermonError;

      const { data: paragraphs, error: paragraphsError } = await supabase
        .from("sermon_paragraphs")
        .select("*")
        .eq("sermon_id", sermonId)
        .order("paragraph_number", { ascending: true });

      if (paragraphsError) throw paragraphsError;

      return { ...sermon, paragraphs: paragraphs || [] };
    } catch (error) {
      console.error("Error fetching sermon with paragraphs:", error);
      toast({
        title: "Error",
        description: "Failed to load sermon content",
        variant: "destructive",
      });
      return null;
    }
  };

  const searchSermons = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    try {
      if (!isSupabaseConfigured) {
        return searchSampleSermonData(searchTerm);
      }

      const { data: sermonData, error } = await supabase
        .from('sermons')
        .select(`
          id,
          title,
          date,
          location,
          sermon_paragraphs (
            paragraph_number,
            content
          )
        `);

      if (error) throw error;

      if (!sermonData) return [];

      const results: SearchResult[] = [];
      sermonData.forEach((sermon: any) => {
        const paragraphs = sermon.sermon_paragraphs || [];
        paragraphs.forEach((para: any) => {
          if (para.content?.toLowerCase().includes(searchTerm)) {
            results.push({
              sermon_id: sermon.id,
              sermon_title: sermon.title,
              sermon_date: sermon.date,
              sermon_location: sermon.location,
              paragraph_number: para.paragraph_number,
              content: para.content,
              relevance: 1,
            });
          }
        });
      });

      if (results.length === 0) {
        return searchSampleSermonData(searchTerm);
      }

      return results.slice(0, 50);
    } catch (error) {
      console.error("Error searching sermons:", error);
      toast({
        title: "Error",
        description: "Failed to search sermons",
        variant: "destructive",
      });
      return searchSampleSermonData(searchTerm);
    }
  };

  return {
    sermons,
    loading,
    fetchSermons,
    fetchSermonWithParagraphs,
    searchSermons,
  };
}

let cachedSampleSermonData: SermonWithParagraphs[] | null = null;

async function loadSampleSermonData(): Promise<SermonWithParagraphs[]> {
  if (cachedSampleSermonData) {
    return cachedSampleSermonData;
  }

  const sampleSermons = await loadSampleSermons();
  cachedSampleSermonData = sampleSermons.map((sermon, index) =>
    convertSampleRecordToSermon(sermon, index)
  );
  return cachedSampleSermonData;
}

function convertSampleRecordToSermon(
  sermon: SampleSermonRecord,
  index: number
): SermonWithParagraphs {
  const sermonId = `sample-sermon-${index}`;
  const paragraphs: SermonParagraph[] = sermon.paragraphs.map((content, paragraphIndex) => ({
    id: `${sermonId}-paragraph-${paragraphIndex + 1}`,
    sermon_id: sermonId,
    paragraph_number: paragraphIndex + 1,
    content,
    created_at: null,
  }));

  return {
    id: sermonId,
    title: sermon.title,
    date: ensureSampleSermonDate(sermon.date, index),
    location: sermon.location || "Unknown Location",
    description: null,
    created_at: null,
    updated_at: null,
    paragraphs,
  };
}

async function searchSampleSermonData(query: string): Promise<SearchResult[]> {
  const sampleData = await loadSampleSermonData();
  const normalizedQuery = query.toLowerCase();

  const results: SearchResult[] = [];
  sampleData.forEach((sermon) => {
    sermon.paragraphs?.forEach((paragraph) => {
      if (paragraph.content.toLowerCase().includes(normalizedQuery)) {
        results.push({
          sermon_id: sermon.id,
          sermon_title: sermon.title,
          sermon_date: sermon.date,
          sermon_location: sermon.location,
          paragraph_number: paragraph.paragraph_number,
          content: paragraph.content,
          relevance: 1,
        });
      }
    });
  });

  return results.slice(0, 50);
}
