import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

export interface Highlight {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string | null;
  color: HighlightColor;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHighlightInput {
  book: string;
  chapter: number;
  verse: number;
  verse_text?: string;
  color?: HighlightColor;
  note?: string;
}

export interface UpdateHighlightInput {
  color?: HighlightColor;
  note?: string;
}

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHighlights = async () => {
    if (!user) {
      setHighlights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("highlights")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      toast({
        title: "Error",
        description: "Failed to load highlights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [user]);

  const createHighlight = async (input: CreateHighlightInput) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create highlights",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("highlights")
        .insert([
          {
            user_id: user.id,
            book: input.book,
            chapter: input.chapter,
            verse: input.verse,
            verse_text: input.verse_text || null,
            color: input.color || "yellow",
            note: input.note || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setHighlights([data, ...highlights]);
      toast({
        title: "Success",
        description: "Highlight added successfully",
      });
      return data;
    } catch (error) {
      console.error("Error creating highlight:", error);
      toast({
        title: "Error",
        description: "Failed to create highlight",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateHighlight = async (id: string, input: UpdateHighlightInput) => {
    try {
      const { data, error } = await supabase
        .from("highlights")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setHighlights(highlights.map((h) => (h.id === id ? data : h)));
      toast({
        title: "Success",
        description: "Highlight updated successfully",
      });
      return data;
    } catch (error) {
      console.error("Error updating highlight:", error);
      toast({
        title: "Error",
        description: "Failed to update highlight",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteHighlight = async (id: string) => {
    try {
      const { error } = await supabase.from("highlights").delete().eq("id", id);

      if (error) throw error;

      setHighlights(highlights.filter((h) => h.id !== id));
      toast({
        title: "Success",
        description: "Highlight removed successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting highlight:", error);
      toast({
        title: "Error",
        description: "Failed to delete highlight",
        variant: "destructive",
      });
      return false;
    }
  };

  const getHighlight = (book: string, chapter: number, verse: number) => {
    return highlights.find(
      (h) => h.book === book && h.chapter === chapter && h.verse === verse
    );
  };

  return {
    highlights,
    loading,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    getHighlight,
    refetch: fetchHighlights,
  };
}
