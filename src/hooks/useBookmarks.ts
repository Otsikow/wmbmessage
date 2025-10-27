import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Bookmark {
  id: string;
  user_id: string;
  sermon_id: string;
  paragraph_number: number;
  created_at: string;
}

export function useBookmarks(sermonId?: string) {
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
      let query = supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", user.id);

      if (sermonId) {
        query = query.eq("sermon_id", sermonId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

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
  }, [user, sermonId]);

  const addBookmark = async (
    sermon_id: string,
    paragraph_number: number
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark paragraphs",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("user_bookmarks")
        .insert([
          {
            user_id: user.id,
            sermon_id,
            paragraph_number,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setBookmarks([data, ...bookmarks]);
      toast({
        title: "Bookmark added",
        description: "Paragraph bookmarked successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error adding bookmark:", error);
      if (error?.code === "23505") {
        toast({
          title: "Already bookmarked",
          description: "This paragraph is already in your bookmarks",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add bookmark",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const removeBookmark = async (
    sermon_id: string,
    paragraph_number: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("sermon_id", sermon_id)
        .eq("paragraph_number", paragraph_number);

      if (error) throw error;

      setBookmarks(
        bookmarks.filter(
          (b) => !(b.sermon_id === sermon_id && b.paragraph_number === paragraph_number)
        )
      );
      toast({
        title: "Bookmark removed",
        description: "Bookmark removed successfully",
      });
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
      return false;
    }
  };

  const isBookmarked = (sermon_id: string, paragraph_number: number): boolean => {
    return bookmarks.some(
      (b) => b.sermon_id === sermon_id && b.paragraph_number === paragraph_number
    );
  };

  const toggleBookmark = async (
    sermon_id: string,
    paragraph_number: number
  ): Promise<boolean> => {
    if (isBookmarked(sermon_id, paragraph_number)) {
      return await removeBookmark(sermon_id, paragraph_number);
    } else {
      return await addBookmark(sermon_id, paragraph_number);
    }
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    refetch: fetchBookmarks,
  };
}
