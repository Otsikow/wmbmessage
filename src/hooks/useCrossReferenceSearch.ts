import { useState, useCallback } from "react";

import { supabase } from "@/integrations/supabase/client";
import { STATIC_CROSS_REFERENCES } from "@/data/staticCrossReferences";
import {
  searchCrossReferences,
  type CrossReferenceRecord,
} from "@/lib/crossReferenceSearch";

function deduplicateCrossReferences(
  records: CrossReferenceRecord[]
): CrossReferenceRecord[] {
  const map = new Map<string, CrossReferenceRecord>();

  records.forEach((record) => {
    const key = [
      record.from_book.toLowerCase(),
      record.from_chapter,
      record.from_verse,
      record.to_book.toLowerCase(),
      record.to_chapter,
      record.to_verse,
      record.to_verse_end ?? "",
      record.relationship_type?.toLowerCase() ?? "",
    ].join("|");

    if (!map.has(key)) {
      map.set(key, record);
    }
  });

  return Array.from(map.values());
}

async function fetchCrossReferenceData(): Promise<CrossReferenceRecord[]> {
  const staticRecords: CrossReferenceRecord[] = STATIC_CROSS_REFERENCES.map(
    (ref) => ({
      ...ref,
      to_verse_end: ref.to_verse_end ?? undefined,
    })
  );

  let supabaseRecords: CrossReferenceRecord[] = [];

  try {
    const { data, error } = await supabase
      .from("cross_references")
      .select("*");

    if (error) {
      throw error;
    }

    supabaseRecords = (data ?? []).map((record) => ({
      ...record,
      to_verse_end: record.to_verse_end ?? undefined,
    }));
  } catch (error) {
    console.warn("Supabase cross-reference fetch failed:", error);
  }

  let fallbackRecords: CrossReferenceRecord[] = [];

  if (supabaseRecords.length === 0) {
    try {
      const response = await fetch("/sample-data/cross-references-sample.json");
      if (response.ok) {
        const data = (await response.json()) as CrossReferenceRecord[];
        fallbackRecords = data.map((record) => ({
          ...record,
          to_verse_end: record.to_verse_end ?? undefined,
        }));
      }
    } catch (error) {
      console.warn("Fallback cross-reference fetch failed:", error);
    }
  }

  const combined = deduplicateCrossReferences([
    ...staticRecords,
    ...supabaseRecords,
    ...fallbackRecords,
  ]);

  if (combined.length === 0) {
    throw new Error("Cross-reference data is unavailable");
  }

  return combined;
}

export function useCrossReferenceSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedRecords, setCachedRecords] = useState<CrossReferenceRecord[] | null>(
    null
  );

  const loadCrossReferences = useCallback(async () => {
    if (cachedRecords) {
      return cachedRecords;
    }

    const records = await fetchCrossReferenceData();
    setCachedRecords(records);
    return records;
  }, [cachedRecords]);

  const performSearch = useCallback(
    async (query: string): Promise<CrossReferenceRecord[]> => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setError(null);
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const records = await loadCrossReferences();
        return searchCrossReferences(trimmedQuery, records);
      } catch (err) {
        console.error("Cross-reference search failed:", err);
        setError("Cross-reference search is currently unavailable.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [loadCrossReferences]
  );

  return {
    searchCrossReferences: performSearch,
    loading,
    error,
  };
}

