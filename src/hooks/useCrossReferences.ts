import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STATIC_CROSS_REFERENCES } from "@/data/staticCrossReferences";


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

type CrossReferenceSourceRecord = Omit<CrossReference, "id"> & {
  id?: string;
};

const normalizeBookName = (value: string) =>
  value.replace(/\s+/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();

let cachedSampleCrossReferences: CrossReference[] | null = null;
let sampleCrossReferencePromise: Promise<CrossReference[]> | null = null;

const createFallbackId = (ref: CrossReferenceSourceRecord, index: number) =>
  ref.id ||
  `sample-${normalizeBookName(ref.from_book)}-${ref.from_chapter}-${ref.from_verse}-${normalizeBookName(ref.to_book)}-${ref.to_chapter}-${ref.to_verse}-${index}`;

async function loadSampleCrossReferences(): Promise<CrossReference[]> {
  if (typeof window === "undefined") {
    return [];
  }

  if (cachedSampleCrossReferences) {
    return cachedSampleCrossReferences;
  }

  if (sampleCrossReferencePromise) {
    return sampleCrossReferencePromise;
  }

  sampleCrossReferencePromise = fetch("/sample-data/cross-references-sample.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load cross-reference sample data");
      }
      return response.json() as Promise<CrossReferenceSourceRecord[]>;
    })
    .then((data) =>
      data.map((ref, index) => ({
        ...ref,
        to_verse_end: ref.to_verse_end ?? undefined,
        id: createFallbackId(ref, index),
      }))
    )
    .catch((error) => {
      console.warn("Cross-reference sample data unavailable:", error);
      return [] as CrossReference[];
    })
    .finally(() => {
      sampleCrossReferencePromise = null;
    });

  cachedSampleCrossReferences = await sampleCrossReferencePromise;
  return cachedSampleCrossReferences;
}

const filterReferencesForLocation = (
  refs: CrossReference[],
  book: string,
  chapter: number,
  verse?: number
) => {
  const normalizedBook = normalizeBookName(book);
  return refs.filter((ref) => {
    if (normalizeBookName(ref.from_book) !== normalizedBook) return false;
    if (ref.from_chapter !== chapter) return false;
    if (verse === undefined) return true;
    return ref.from_verse === verse;
  });
};

export function useCrossReferences(
  book: string,
  chapter: number,
  verse?: number
): UseCrossReferencesReturn {
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [userCrossReferences, setUserCrossReferences] = useState<UserCrossReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterStaticCrossReferences = useCallback(() => {
    if (!book || !chapter) return [] as CrossReference[];
    return filterReferencesForLocation(STATIC_CROSS_REFERENCES, book, chapter, verse);
  }, [book, chapter, verse]);

  const mergeCrossReferences = useCallback((
    staticRefs: CrossReference[],
    dynamicRefs: CrossReference[]
  ) => {
    const seen = new Set<string>();
    const combined: CrossReference[] = [];

    const relationshipPriority = (type?: string | null) => {
      const priorities: Record<string, number> = {
        fulfillment: 0,
        prophecy: 1,
        quotation: 2,
        parallel: 3,
        related: 4,
        vision: 5,
      };
      if (!type) return priorities.related;
      return priorities[type] ?? priorities.related;
    };

    const addReference = (ref: CrossReference) => {
      const key = [
        ref.from_book.toLowerCase(),
        ref.from_chapter,
        ref.from_verse,
        ref.to_book.toLowerCase(),
        ref.to_chapter,
        ref.to_verse,
        ref.to_verse_end ?? "",
      ].join("|");

      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          ...ref,
          relationship_type: ref.relationship_type || "related",
        });
      }
    };

    staticRefs.forEach(addReference);
    dynamicRefs.forEach(addReference);

    return combined
      .slice()
      .sort((a, b) => {
        const typeDiff = relationshipPriority(a.relationship_type) - relationshipPriority(b.relationship_type);
        if (typeDiff !== 0) return typeDiff;

        const bookCompare = a.to_book.localeCompare(b.to_book);
        if (bookCompare !== 0) return bookCompare;

        if (a.to_chapter !== b.to_chapter) {
          return a.to_chapter - b.to_chapter;
        }

        return a.to_verse - b.to_verse;
      });
  }, []);

  const fetchCrossReferences = useCallback(async () => {
    if (!book || !chapter) {
      setCrossReferences([]);
      setUserCrossReferences([]);
      setLoading(false);
      setError(null);
      return;
    }

    const staticMatches = filterStaticCrossReferences();
    setCrossReferences(mergeCrossReferences(staticMatches, []));
    setLoading(staticMatches.length === 0);
    setError(null);

    try {
      let dynamicReferences: CrossReference[] = [];

      try {
        let publicQuery = supabase
          .from('cross_references')
          .select('*')
          .eq('from_book', book)
          .eq('from_chapter', chapter);

        if (verse !== undefined) {
          publicQuery = publicQuery.eq('from_verse', verse);
        }

        const { data: publicData, error: publicError } = await publicQuery;

        if (publicError) {
          console.warn('Public cross-reference fetch failed:', publicError);
        } else if (publicData) {
          dynamicReferences = publicData;
        }
      } catch (publicErr) {
        console.warn('Public cross-reference fetch error:', publicErr);
      }

      let fallbackMatches: CrossReference[] = [];
      try {
        const sampleData = await loadSampleCrossReferences();
        fallbackMatches = filterReferencesForLocation(sampleData, book, chapter, verse);
      } catch (sampleErr) {
        console.warn('Sample cross-reference load error:', sampleErr);
      }

      const merged = mergeCrossReferences(staticMatches, [...dynamicReferences, ...fallbackMatches]);
      setCrossReferences(merged);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        try {
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

          if (userError) {
            console.warn('User cross-reference fetch failed:', userError);
          } else {
            setUserCrossReferences((userData as any) || []);
          }
        } catch (userErr) {
          console.warn('User cross-reference fetch error:', userErr);
        }
      } else {
        setUserCrossReferences([]);
      }
    } catch (err) {
      console.error('Error fetching cross-references:', err);
      setError('Failed to load cross-references');
    } finally {
      setLoading(false);
    }
  }, [book, chapter, verse, filterStaticCrossReferences, mergeCrossReferences]);

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
