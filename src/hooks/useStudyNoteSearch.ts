import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StudyNote } from "@/types/studyNotes";

export type StudyNoteSummary = Pick<
  StudyNote,
  "id" | "slug" | "title" | "topic" | "tags" | "excerpt" | "created_at" | "updated_at"
>;

const LIST_COLUMNS =
  "id, slug, title, topic, tags, excerpt, created_at, updated_at";

/** Normalise for comparison: lowercase, strip punctuation, collapse spaces. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}:]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokenize(query: string): string[] {
  return normalizeText(query)
    .split(" ")
    .map((t) => t.replace(/[:]/g, " ").trim())
    .flatMap((t) => t.split(/\s+/))
    .filter(Boolean);
}

/**
 * Build Postgres tsqueries from free text.
 * `phrase` keeps multi-word queries adjacent (strict, high precision);
 * `all` requires every word anywhere in the note (broader fallback).
 * The final token is prefix-matched so partial words work while typing.
 */
export function buildTsQueries(query: string): { phrase: string; all: string } {
  const tokens = tokenize(query);
  if (tokens.length === 0) return { phrase: "", all: "" };
  const prefixed = tokens.map((t, i) => (i === tokens.length - 1 ? `${t}:*` : t));
  return {
    phrase: prefixed.join(" <-> "),
    all: tokens.map((t) => `${t}:*`).join(" & "),
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_,()]/g, " ").trim();
}

export function scoreNote(note: StudyNoteSummary, rawQuery: string): number {
  const q = normalizeText(rawQuery);
  if (!q) return 0;
  const words = q.split(" ").filter(Boolean);
  const title = normalizeText(note.title);
  const topic = normalizeText(note.topic);
  const tags = normalizeText((note.tags || []).join(" "));
  const excerpt = normalizeText(note.excerpt || "");

  if (title === q) return 100;
  if (title.includes(q)) return 85;
  // Sermon / message title style matches (all words present in title)
  if (words.every((w) => title.includes(w))) return 70;
  if (tags.includes(q) || topic.includes(q)) return 60;
  if (words.every((w) => `${tags} ${topic}`.includes(w))) return 50;
  // Scripture references usually live in the excerpt/body
  if (excerpt.includes(q)) return 40;
  if (words.every((w) => excerpt.includes(w))) return 30;
  return 20; // matched in body via full-text search
}

interface Options {
  query: string;
  topic: string; // "All" for every topic
  debounceMs?: number;
}

interface Result {
  notes: StudyNoteSummary[] | null;
  loading: boolean;
  error: string | null;
  isSearching: boolean;
  allTopics: string[];
}

export function useStudyNoteSearch({ query, topic, debounceMs = 300 }: Options): Result {
  const [debounced, setDebounced] = useState(query);
  const [notes, setNotes] = useState<StudyNoteSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const trimmed = debounced.trim();

  useEffect(() => {
    const id = ++requestId.current;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const applyTopic = <T,>(builder: T): T =>
          topic && topic !== "All" ? ((builder as any).eq("topic", topic) as T) : builder;

        let rows: StudyNoteSummary[] = [];

        if (!trimmed) {
          const { data, error } = await applyTopic(
            supabase
              .from("message_study_notes" as any)
              .select(LIST_COLUMNS)
              .eq("status", "published"),
          ).order("title", { ascending: true });
          if (error) throw error;
          rows = (data as unknown as StudyNoteSummary[]) || [];
        } else {
          const { phrase, all } = buildTsQueries(trimmed);
          const like = escapeIlike(trimmed);

          const fts = (tsQuery: string) =>
            applyTopic(
              supabase
                .from("message_study_notes" as any)
                .select(LIST_COLUMNS)
                .eq("status", "published")
                .textSearch("search_tsv", tsQuery),
            ).limit(200);

          const likePromise = like
            ? applyTopic(
                supabase
                  .from("message_study_notes" as any)
                  .select(LIST_COLUMNS)
                  .eq("status", "published")
                  .or(
                    [
                      `title.ilike.%${like}%`,
                      `topic.ilike.%${like}%`,
                      `excerpt.ilike.%${like}%`,
                    ].join(","),
                  ),
              ).limit(100)
            : Promise.resolve({ data: [], error: null } as any);

          // Strict phrase pass first; only widen to "all words anywhere"
          // when the phrase yields nothing.
          const [ftsRes, likeRes] = await Promise.all([
            phrase ? fts(phrase) : Promise.resolve({ data: [], error: null } as any),
            likePromise,
          ]);

          let ftsRows = ((ftsRes.data as unknown as StudyNoteSummary[]) || []) as StudyNoteSummary[];
          const likeRows = ((likeRes.data as unknown as StudyNoteSummary[]) || []) as StudyNoteSummary[];

          if (ftsRows.length === 0 && likeRows.length === 0 && all && all !== phrase) {
            const wide = await fts(all);
            ftsRows = ((wide.data as unknown as StudyNoteSummary[]) || []) as StudyNoteSummary[];
          }

          if (cancelled || id !== requestId.current) return;

          const merged = new Map<string, StudyNoteSummary>();
          for (const row of [...ftsRows, ...likeRows]) {
            merged.set(row.id, row);
          }


          rows = Array.from(merged.values()).sort((a, b) => {
            const diff = scoreNote(b, trimmed) - scoreNote(a, trimmed);
            if (diff !== 0) return diff;
            return a.title.localeCompare(b.title);
          });
        }

        if (cancelled || id !== requestId.current) return;
        setNotes(rows);
        setError(null);
      } catch (err) {
        if (cancelled || id !== requestId.current) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setNotes([]);
      } finally {
        if (!cancelled && id === requestId.current) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trimmed, topic]);

  // Topic list is independent of the current query/filter.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("message_study_notes" as any)
        .select("topic")
        .eq("status", "published");
      if (cancelled || !data) return;
      const set = new Set<string>();
      (data as unknown as { topic: string }[]).forEach((r) => r.topic && set.add(r.topic));
      setAllTopics(Array.from(set).sort((a, b) => a.localeCompare(b)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      notes,
      loading,
      error,
      isSearching: trimmed.length > 0,
      allTopics,
    }),
    [notes, loading, error, trimmed, allTopics],
  );
}
