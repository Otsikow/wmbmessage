import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CrossReference {
  id: string;
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  to_verse_end?: number;
  relationship_type?: string;
  notes?: string;
}

export interface UserCrossReference extends CrossReference {
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UseCrossReferencesReturn {
  crossReferences: CrossReference[];
  userCrossReferences: UserCrossReference[];
  loading: boolean;
  error: string | null;
  addUserCrossReference: (ref: Omit<UserCrossReference, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteUserCrossReference: (id: string) => Promise<void>;
}

export function useCrossReferences(
  book: string,
  chapter: number,
  verse?: number
): UseCrossReferencesReturn {
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [userCrossReferences, setUserCrossReferences] = useState<UserCrossReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrossReferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch public cross-references
      let publicQuery = supabase
        .from('cross_references')
        .select('*')
        .eq('from_book', book)
        .eq('from_chapter', chapter);

      if (verse !== undefined) {
        publicQuery = publicQuery.eq('from_verse', verse);
      }

      const { data: publicData, error: publicError } = await publicQuery;

      if (publicError) throw publicError;

      setCrossReferences(publicData || []);

      // Fetch user's custom cross-references if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let userQuery = (supabase as any)
          .from('user_cross_references')
          .select('*')
          .eq('user_id', user.id)
          .eq('from_book', book)
          .eq('from_chapter', chapter);

        if (verse !== undefined) {
          userQuery = userQuery.eq('from_verse', verse);
        }

        const { data: userData, error: userError } = await userQuery;

        if (userError) throw userError;

        setUserCrossReferences(userData as any || []);
      }
    } catch (err) {
      console.error('Error fetching cross-references:', err);
      setError('Failed to load cross-references');
    } finally {
      setLoading(false);
    }
  }, [book, chapter, verse]);

  useEffect(() => {
    fetchCrossReferences();
  }, [fetchCrossReferences]);

  const addUserCrossReference = async (
    ref: Omit<UserCrossReference, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add custom cross-references');
      }

      const { data, error } = await (supabase as any)
        .from('user_cross_references')
        .insert([
          {
            user_id: user.id,
            ...ref,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setUserCrossReferences([...userCrossReferences, data as any]);
    } catch (err) {
      console.error('Error adding cross-reference:', err);
      throw err;
    }
  };

  const deleteUserCrossReference = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('user_cross_references')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserCrossReferences(userCrossReferences.filter(ref => ref.id !== id));
    } catch (err) {
      console.error('Error deleting cross-reference:', err);
      throw err;
    }
  };

  return {
    crossReferences,
    userCrossReferences,
    loading,
    error,
    addUserCrossReference,
    deleteUserCrossReference,
  };
}
