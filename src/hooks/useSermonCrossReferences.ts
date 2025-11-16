import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BibleVerseData, SermonReference } from "@/components/CrossReferenceCard";
import { getVerseText, isWordsOfJesus } from "@/utils/bibleData";

export interface SermonCrossReference {
  id: string;
  bibleVerse: BibleVerseData;
  sermonReference: SermonReference;
}

interface SupabaseSermonCrossReferenceRow {
  id: string;
  bible_book: string;
  bible_chapter: number;
  bible_verse: number;
  reference_note: string | null;
  sermon_id: string;
  paragraph_number: number;
  sermons:
    | null
    | {
        title: string | null;
        date: string | null;
        location: string | null;
      }
    | Array<{
        title: string | null;
        date: string | null;
        location: string | null;
      }>;
  sermon_paragraphs:
    | null
    | {
        paragraph_number: number | null;
        content: string | null;
      }
    | Array<{
        paragraph_number: number | null;
        content: string | null;
      }>;
}

interface UseSermonCrossReferencesReturn {
  sermonCrossReferences: SermonCrossReference[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  currentReference: SermonCrossReference | null;
  hasNext: boolean;
  hasPrevious: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
}

export function useSermonCrossReferences(
  book: string,
  chapter: number,
  verse?: number
): UseSermonCrossReferencesReturn {
  const [sermonCrossReferences, setSermonCrossReferences] = useState<SermonCrossReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchSermonCrossReferences = useCallback(async () => {
    if (!book || !chapter) {
      setSermonCrossReferences([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('sermon_cross_references')
        .select(`
          id,
          bible_book,
          bible_chapter,
          bible_verse,
          reference_note,
          sermon_id,
          paragraph_number,
          sermons!sermon_cross_references_sermon_id_fkey (
            title,
            date,
            location
          )
        `)
        .eq('bible_book', book)
        .eq('bible_chapter', chapter);

      if (verse !== undefined) {
        query = query.eq('bible_verse', verse);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (!data) {
        setSermonCrossReferences([]);
        setLoading(false);
        return;
      }

      // Fetch Bible verse text for each reference
      const typedData = data as SupabaseSermonCrossReferenceRow[];

      const references = await Promise.all(
        typedData.map(async (item) => {
          const sermon = Array.isArray(item.sermons) ? item.sermons[0] : item.sermons;
          const paragraph = Array.isArray(item.sermon_paragraphs)
            ? item.sermon_paragraphs[0]
            : item.sermon_paragraphs;

          let verseText =
            (await getVerseText(item.bible_book, item.bible_chapter, item.bible_verse)) || '';

          if (!verseText) {
            verseText =
              (await fetchVerseFromApi(
                item.bible_book,
                item.bible_chapter,
                item.bible_verse
              )) || '';
          }

          const jesusWords = isWordsOfJesus(
            item.bible_book,
            item.bible_chapter,
            item.bible_verse
          );

          return {
            id: item.id,
            bibleVerse: {
              book: item.bible_book,
              chapter: item.bible_chapter,
              verse: item.bible_verse,
              text: verseText || 'Unable to load verse text',
              isJesusWords: jesusWords,
            },
            sermonReference: {
              id: item.sermon_id,
              sermon_title: sermon?.title || 'Unknown Sermon',
              sermon_date: sermon?.date
                ? new Date(sermon.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown Date',
              sermon_location: sermon?.location || 'Unknown Location',
              paragraph_number: paragraph?.paragraph_number || 0,
              paragraph_content: paragraph?.content || '',
              reference_note: item.reference_note,
            },
          };
        })
      );

      setSermonCrossReferences(references);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching sermon cross-references:', err);
      setError('Failed to load sermon cross-references');
    } finally {
      setLoading(false);
    }
  }, [book, chapter, verse]);

  useEffect(() => {
    fetchSermonCrossReferences();
  }, [fetchSermonCrossReferences]);

  const goToNext = useCallback(() => {
    if (currentIndex < sermonCrossReferences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, sermonCrossReferences.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < sermonCrossReferences.length) {
      setCurrentIndex(index);
    }
  }, [sermonCrossReferences.length]);

  return {
    sermonCrossReferences,
    loading,
    error,
    currentIndex,
    currentReference: sermonCrossReferences[currentIndex] || null,
    hasNext: currentIndex < sermonCrossReferences.length - 1,
    hasPrevious: currentIndex > 0,
    goToNext,
    goToPrevious,
    goToIndex,
  };
}

async function fetchVerseFromApi(
  book: string,
  chapter: number,
  verse: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://getbible.net/v2/kjv/${encodeURIComponent(book)}/${chapter}/${verse}.json`
    );

    if (!response.ok) {
      return null;
    }

    const bibleData = await response.json();
    if (bibleData?.verses?.[0]?.text) {
      return bibleData.verses[0].text.replace(/<[^>]*>/g, '').trim();
    }
  } catch (error) {
    console.warn('Unable to fetch verse text from API:', error);
  }

  return null;
}
