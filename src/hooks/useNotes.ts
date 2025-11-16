import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { PostgrestError } from "@supabase/supabase-js";

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
  source_type: string;
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
  source_type: string;
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
  const [useLegacyNotesFallback, setUseLegacyNotesFallback] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const mapLegacyNoteToUserNote = (note: Note): UserNote => ({
    id: note.id,
    user_id: note.user_id,
    source_type: note.verse_reference ? "bible" : "sermon",
    source_id: note.verse_reference || note.title,
    title: note.title,
    content: note.content || "",
    verse_reference: note.verse_reference,
    sermon_title: note.verse_reference ? null : note.title,
    tags: [],
    created_at: note.created_at,
    updated_at: note.updated_at,
  });

  const fetchLegacyNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    setUserNotes((data || []).map(mapLegacyNoteToUserNote));
  };

  const isUserNotesTableMissing = (error: unknown): error is PostgrestError => {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as PostgrestError).code === "42P01"
    );
  };

  const fetchUserNotes = async () => {
    if (!user) {
      setUserNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (useLegacyNotesFallback) {
        await fetchLegacyNotes();
        return;
      }

      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setUserNotes(data || []);
    } catch (error) {
      if (isUserNotesTableMissing(error)) {
        console.warn(
          "user_notes table not found. Falling back to legacy notes table.",
          error,
        );
        setUseLegacyNotesFallback(true);
        try {
          await fetchLegacyNotes();
        } catch (legacyError) {
          console.error("Error fetching legacy notes:", legacyError);
          toast({
            title: "Error",
            description: "Failed to load notes",
            variant: "destructive",
          });
        }
      } else {
        console.error("Error fetching user notes:", error);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNotes();
  }, [user]);

  const createUserNote = async (input: CreateUserNoteInput) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (useLegacyNotesFallback) {
        const created = await createLegacyUserNote(input);
        return created;
      }

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

      setUserNotes((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      return data;
    } catch (error) {
      if (isUserNotesTableMissing(error)) {
        console.warn(
          "user_notes table not found while creating note. Falling back to legacy table.",
          error,
        );
        setUseLegacyNotesFallback(true);
        try {
          const created = await createLegacyUserNote(input);
          return created;
        } catch (legacyError) {
          console.error("Error creating legacy note:", legacyError);
          toast({
            title: "Error",
            description: "Failed to create note",
            variant: "destructive",
          });
          return null;
        }
      }

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
    try {
      if (useLegacyNotesFallback) {
        const updated = await updateLegacyUserNote(id, input);
        return updated;
      }

      const { data, error } = await supabase
        .from("user_notes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setUserNotes((prev) => prev.map((note) => (note.id === id ? data : note)));
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return data;
    } catch (error) {
      if (isUserNotesTableMissing(error)) {
        console.warn(
          "user_notes table not found while updating note. Falling back to legacy table.",
          error,
        );
        setUseLegacyNotesFallback(true);
        try {
          const updated = await updateLegacyUserNote(id, input);
          return updated;
        } catch (legacyError) {
          console.error("Error updating legacy note:", legacyError);
          toast({
            title: "Error",
            description: "Failed to update note",
            variant: "destructive",
          });
          return null;
        }
      }

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
    try {
      if (useLegacyNotesFallback) {
        const deleted = await deleteLegacyUserNote(id);
        return deleted;
      }

      const { error } = await supabase.from("user_notes").delete().eq("id", id);

      if (error) throw error;

      setUserNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (error) {
      if (isUserNotesTableMissing(error)) {
        console.warn(
          "user_notes table not found while deleting note. Falling back to legacy table.",
          error,
        );
        setUseLegacyNotesFallback(true);
        try {
          const deleted = await deleteLegacyUserNote(id);
          return deleted;
        } catch (legacyError) {
          console.error("Error deleting legacy note:", legacyError);
          toast({
            title: "Error",
            description: "Failed to delete note",
            variant: "destructive",
          });
          return false;
        }
      }

      console.error("Error deleting user note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      return false;
    }
  };

  const createLegacyUserNote = async (input: CreateUserNoteInput) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: user.id,
          title: input.title || input.source_id,
          content: input.content,
          verse_reference:
            input.verse_reference ||
            (input.source_type === "bible" ? input.source_id : null),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const mapped = mapLegacyNoteToUserNote(data);
    setUserNotes((prev) => [mapped, ...prev]);
    toast({
      title: "Success",
      description: "Note created successfully",
    });
    return mapped;
  };

  const updateLegacyUserNote = async (
    id: string,
    input: UpdateUserNoteInput,
  ) => {
    const legacyUpdate: UpdateNoteInput = {};

    if (typeof input.title !== "undefined") {
      legacyUpdate.title = input.title;
    }

    if (typeof input.content !== "undefined") {
      legacyUpdate.content = input.content;
    }

    if (typeof input.verse_reference !== "undefined") {
      legacyUpdate.verse_reference = input.verse_reference;
    } else if (
      typeof input.source_type !== "undefined" &&
      input.source_type === "bible" &&
      typeof input.source_id !== "undefined"
    ) {
      legacyUpdate.verse_reference = input.source_id;
    }

    const { data, error } = await supabase
      .from("notes")
      .update(legacyUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const mapped = mapLegacyNoteToUserNote(data);
    setUserNotes((prev) => prev.map((note) => (note.id === id ? mapped : note)));
    toast({
      title: "Success",
      description: "Note updated successfully",
    });
    return mapped;
  };

  const deleteLegacyUserNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) throw error;

    setUserNotes((prev) => prev.filter((note) => note.id !== id));
    toast({
      title: "Success",
      description: "Note deleted successfully",
    });
    return true;
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
