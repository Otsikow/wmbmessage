import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sermon } from "@/hooks/useSermons";
import { loadSampleSermons, SampleSermonRecord, ensureSampleSermonDate } from "@/utils/sampleSermons";

interface ParagraphRow {
  paragraph_number: number | null;
  content: string | null;
}

interface SupabaseSermonRow extends Sermon {
  sermon_paragraphs: ParagraphRow[] | null;
  sermon_cross_references: { id: string }[] | null;
}

export interface SermonSummary {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string | null;
  created_at: string | null;
  updated_at: string | null;
  excerpt: string;
  paragraphCount: number;
  crossReferenceCount: number;
}

export function useSermonSummaries() {
  const [sermons, setSermons] = useState<SermonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const sampleSummaries = await loadSampleSermonSummaries();
        setSermons(sampleSummaries);
        return;
      }

      const { data, error } = await supabase
        .from("sermons")
        .select(`
          id,
          title,
          date,
          location,
          created_at,
          updated_at,
          sermon_paragraphs ( paragraph_number, content ),
          sermon_cross_references ( id )
        `)
        .order("date", { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as SupabaseSermonRow[];

      if (typedData.length === 0) {
        const sampleSummaries = await loadSampleSermonSummaries();
        setSermons(sampleSummaries);
        return;
      }

      const summaries = typedData.map((sermon) => {
        const paragraphs = (sermon.sermon_paragraphs || []) as ParagraphRow[];

        const sortedParagraphs = [...paragraphs].sort((a, b) => {
          const aNumber = a.paragraph_number ?? Number.MAX_SAFE_INTEGER;
          const bNumber = b.paragraph_number ?? Number.MAX_SAFE_INTEGER;
          return aNumber - bNumber;
        });

        const firstParagraph = sortedParagraphs.find((paragraph) => paragraph.content?.trim());
        const excerptSource = firstParagraph?.content?.trim() || "";
        const excerpt = excerptSource.length > 240
          ? `${excerptSource.slice(0, 237).trimEnd()}...`
          : excerptSource;

        const paragraphCount = paragraphs.filter((paragraph) => paragraph.content?.trim()).length;
        const crossReferenceCount = sermon.sermon_cross_references?.length ?? 0;

        const summary: SermonSummary = {
          id: sermon.id,
          title: sermon.title,
          date: sermon.date,
          location: sermon.location,
          description: sermon.description,
          created_at: sermon.created_at,
          updated_at: sermon.updated_at,
          excerpt,
          paragraphCount,
          crossReferenceCount,
        };

        return summary;
      });

      setSermons(summaries);
    } catch (error) {
      console.error("Error fetching sermon summaries:", error);
      if (isSupabaseConfigured) {
        toast({
          title: "Error",
          description: "Unable to load sermons right now.",
          variant: "destructive",
        });
      }
      const sampleSummaries = await loadSampleSermonSummaries();
      setSermons(sampleSummaries);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { sermons, loading, refetch: fetchSummaries };
}

let cachedSampleSummaries: SermonSummary[] | null = null;

async function loadSampleSermonSummaries(): Promise<SermonSummary[]> {
  if (cachedSampleSummaries) {
    return cachedSampleSummaries;
  }

  const sampleSermons = await loadSampleSermons();
  cachedSampleSummaries = sampleSermons.map((sermon, index) =>
    convertSampleToSummary(sermon, index)
  );
  return cachedSampleSummaries;
}

function convertSampleToSummary(
  sermon: SampleSermonRecord,
  index: number
): SermonSummary {
  const firstParagraph = sermon.paragraphs.find((paragraph) => paragraph.trim());
  const excerptSource = firstParagraph?.trim() ?? "";
  const excerpt =
    excerptSource.length > 240
      ? `${excerptSource.slice(0, 237).trimEnd()}...`
      : excerptSource;

  return {
    id: `sample-sermon-${index}`,
    title: sermon.title,
    date: ensureSampleSermonDate(sermon.date, index),
    location: sermon.location || "Unknown Location",
    description: null,
    created_at: null,
    updated_at: null,
    excerpt,
    paragraphCount: sermon.paragraphs.length,
    crossReferenceCount: 0,
  };
}
