import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BibleVerseData, SermonReference } from "@/components/CrossReferenceCard";

export interface SermonCrossReference {
  id: string;
  bibleVerse: BibleVerseData;
  sermonReference: SermonReference;
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
          paragraph_id,
          sermons!sermon_cross_references_sermon_id_fkey (
            title,
            date,
            location
          ),
          sermon_paragraphs!sermon_cross_references_paragraph_id_fkey (
            paragraph_number,
            content
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
      const references = await Promise.all(
        data.map(async (item: any) => {
          try {
            // Fetch verse text from getBible API
            const response = await fetch(
              `https://getbible.net/v2/kjv/${encodeURIComponent(item.bible_book)}/${item.bible_chapter}/${item.bible_verse}.json`
            );

            let verseText = '';
            let isJesusWords = false;

            if (response.ok) {
              const bibleData = await response.json();
              if (bibleData?.verses?.[0]) {
                verseText = bibleData.verses[0].text?.replace(/<[^>]*>/g, '').trim() || '';
                // Check if it's Jesus' words (this is a simplified check)
                isJesusWords = bibleData.verses[0].text?.includes('class="woj"') || false;
              }
            }

            const sermon = Array.isArray(item.sermons) ? item.sermons[0] : item.sermons;
            const paragraph = Array.isArray(item.sermon_paragraphs) 
              ? item.sermon_paragraphs[0] 
              : item.sermon_paragraphs;

            return {
              id: item.id,
              bibleVerse: {
                book: item.bible_book,
                chapter: item.bible_chapter,
                verse: item.bible_verse,
                text: verseText,
                isJesusWords,
              },
              sermonReference: {
                id: item.sermon_id,
                sermon_title: sermon?.title || 'Unknown Sermon',
                sermon_date: sermon?.date 
                  ? new Date(sermon.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown Date',
                sermon_location: sermon?.location || 'Unknown Location',
                paragraph_number: paragraph?.paragraph_number || 0,
                paragraph_content: paragraph?.content || '',
                reference_note: item.reference_note,
              },
            };
          } catch (err) {
            console.error('Error fetching verse text:', err);
            // Return the reference even if we couldn't fetch the verse text
            const sermon = Array.isArray(item.sermons) ? item.sermons[0] : item.sermons;
            const paragraph = Array.isArray(item.sermon_paragraphs) 
              ? item.sermon_paragraphs[0] 
              : item.sermon_paragraphs;

            return {
              id: item.id,
              bibleVerse: {
                book: item.bible_book,
                chapter: item.bible_chapter,
                verse: item.bible_verse,
                text: 'Unable to load verse text',
                isJesusWords: false,
              },
              sermonReference: {
                id: item.sermon_id,
                sermon_title: sermon?.title || 'Unknown Sermon',
                sermon_date: sermon?.date 
                  ? new Date(sermon.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown Date',
                sermon_location: sermon?.location || 'Unknown Location',
                paragraph_number: paragraph?.paragraph_number || 0,
                paragraph_content: paragraph?.content || '',
                reference_note: item.reference_note,
              },
            };
          }
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
