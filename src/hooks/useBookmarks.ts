import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Bookmark {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string | null;
  created_at: string;
}

export interface CreateBookmarkInput {
  book: string;
  chapter: number;
  verse: number;
  verse_text?: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBookmarks = async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const createBookmark = async (input: CreateBookmarkInput) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create bookmarks",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([
          {
            user_id: user.id,
            book: input.book,
            chapter: input.chapter,
            verse: input.verse,
            verse_text: input.verse_text || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setBookmarks([data, ...bookmarks]);
      toast({
        title: "Success",
        description: "Bookmark added successfully",
      });
      return data;
    } catch (error) {
      console.error("Error creating bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to create bookmark",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);

      if (error) throw error;

      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
      toast({
        title: "Success",
        description: "Bookmark removed successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive",
      });
      return false;
    }
  };

  const isBookmarked = (book: string, chapter: number, verse: number) => {
    return bookmarks.some(
      (b) => b.book === book && b.chapter === chapter && b.verse === verse
    );
  };

  return {
    bookmarks,
    loading,
    createBookmark,
    deleteBookmark,
    isBookmarked,
    refetch: fetchBookmarks,
  };
}
