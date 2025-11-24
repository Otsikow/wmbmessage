import { useState, useEffect } from "react";
import {
  isSupabaseConfigured,
  supabase,
} from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  verse_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserNote {
  id: string;
  user_id: string;
  source_type: "bible" | "sermon";
  source_id: string;
  title: string;
  content: string;
  verse_reference: string | null;
  sermon_title?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  verse_reference?: string;
}

export interface CreateUserNoteInput {
  source_type: "bible" | "sermon";
  source_id: string;
  title?: string;
  content: string;
  verse_reference?: string | null;
  sermon_title?: string | null;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  verse_reference?: string;
}

export interface UpdateUserNoteInput {
  source_type?: "bible" | "sermon";
  source_id?: string;
  title?: string;
  content?: string;
  verse_reference?: string | null;
  sermon_title?: string | null;
  tags?: string[];
}

// Legacy hook for old notes table
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createNote = async (input: CreateNoteInput) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: user.id,
            title: input.title,
            content: input.content || null,
            verse_reference: input.verse_reference || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      return data;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateNote = async (id: string, input: UpdateNoteInput) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setNotes(notes.map((note) => (note.id === id ? data : note)));
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return data;
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}

// New hook for user_notes table with enhanced features
export function useUserNotes() {
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUserNotes = async () => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase is not configured. Skipping user notes fetch.");
      setUserNotes([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setUserNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setUserNotes(data || []);
    } catch (error) {
      console.error("Error fetching user notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNotes();
  }, [user]);

  const createUserNote = async (input: CreateUserNoteInput) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Notes unavailable",
        description:
          "Supabase is not configured. Add your Supabase keys to create notes.",
        variant: "destructive",
      });
      return null;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("user_notes")
        .insert([
          {
            user_id: user.id,
            source_type: input.source_type,
            source_id: input.source_id,
            title: input.title || "Untitled Note",
            content: input.content,
            verse_reference: input.verse_reference || null,
            sermon_title: input.sermon_title || null,
            tags: input.tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setUserNotes([data, ...userNotes]);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      return data;
    } catch (error) {
      console.error("Error creating user note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateUserNote = async (id: string, input: UpdateUserNoteInput) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Notes unavailable",
        description:
          "Supabase is not configured. Add your Supabase keys to edit notes.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("user_notes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setUserNotes(userNotes.map((note) => (note.id === id ? data : note)));
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return data;
    } catch (error) {
      console.error("Error updating user note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteUserNote = async (id: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Notes unavailable",
        description:
          "Supabase is not configured. Add your Supabase keys to delete notes.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from("user_notes").delete().eq("id", id);

      if (error) throw error;

      setUserNotes(userNotes.filter((note) => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting user note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    userNotes,
    loading,
    createUserNote,
    updateUserNote,
    deleteUserNote,
    refetch: fetchUserNotes,
  };
}
