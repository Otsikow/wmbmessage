import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

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
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      toast({
        title: "Error",
        description: "Failed to load sermons",
        variant: "destructive",
      });
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
    try {
      const { data, error } = await supabase.rpc("search_sermon_content", {
        search_query: query,
        result_limit: 50,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching sermons:", error);
      toast({
        title: "Error",
        description: "Failed to search sermons",
        variant: "destructive",
      });
      return [];
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
