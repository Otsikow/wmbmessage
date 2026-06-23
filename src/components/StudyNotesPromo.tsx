import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Tag, ArrowRight, BookMarked, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { type StudyNote } from "@/types/studyNotes";
import { buildExcerpt } from "@/lib/studyNoteFormatter";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Prominent home-page CTA for the Message Study Notes feature.
 * Highlights the library of searchable, auto-formatted study notes.
 */
export default function StudyNotesPromo() {
  const [latest, setLatest] = useState<StudyNote[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("message_study_notes" as any)
        .select("*")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(4);
      if (cancelled) return;
      if (error) {
        console.error("Failed to load latest study notes:", error);
        setLatest([]);
      } else {
        setLatest((data as unknown as StudyNote[]) || []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-amber-50/60 via-background to-orange-50/40 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20 p-4 sm:p-6 lg:p-8 shadow-elegant">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
              <BookMarked className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Tag className="h-3 w-3" />
                Study Library
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight break-words">
                Message Study Notes
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Deep, searchable study notes on the Message of the Hour — with
                scripture boxes, Brother Branham quotes, key teaching points,
                and clean formatting for believers, ministers, and pastors.
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground border border-border">
                  <BookOpen className="h-3 w-3" />
                  Scriptures
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground border border-border">
                  <Search className="h-3 w-3" />
                  Searchable
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground border border-border">
                  <Tag className="h-3 w-3" />
                  Topics
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0 w-full lg:w-auto">
            <Button asChild size="lg" className="min-h-[48px] w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              <Link to="/study-notes" aria-label="Open Message Study Notes">
                Open Study Notes
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-[48px] w-full sm:w-auto"
            >
              <Link to="/study-notes" aria-label="Search study notes">
                <Search className="mr-1 h-4 w-4" aria-hidden="true" />
                Search Topics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Latest study notes preview */}
      <div className="mt-4 sm:mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Latest notes
          </h3>
          <Link
            to="/study-notes"
            className="inline-flex items-center text-xs sm:text-sm text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {latest === null ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : latest.length === 0 ? null : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((note) => {
              const href = `/study-notes/${note.slug || note.id}`;
              const preview = note.excerpt || buildExcerpt(note.body, 90);
              return (
                <Link
                  key={note.id}
                  to={href}
                  className="group block rounded-xl border border-border bg-background/60 hover:bg-accent/40 hover:border-primary/40 transition p-3.5 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {note.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs mb-2 gap-1">
                    <Tag className="h-3 w-3" />
                    {note.topic}
                  </Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                    {preview}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.updated_at || note.created_at)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
