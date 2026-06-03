import { Link } from "react-router-dom";
import { BookOpen, Search, Tag, ArrowRight, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Prominent home-page CTA for the Message Study Notes feature.
 * Highlights the library of searchable, auto-formatted study notes.
 */
export default function StudyNotesPromo() {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-amber-50/60 via-background to-orange-50/40 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20 p-6 sm:p-8 shadow-elegant">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
              <BookMarked className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Tag className="h-3 w-3" />
                Study Library
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                Message Study Notes
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Deep, searchable study notes on the Message of the Hour — with
                scripture boxes, Brother Branham quotes, key teaching points,
                and clean formatting for believers, ministers, and pastors.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
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

          <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
            <Button asChild size="lg" className="min-h-[48px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              <Link to="/study-notes" aria-label="Open Message Study Notes">
                Open Study Notes
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-[48px]"
            >
              <Link to="/study-notes" aria-label="Search study notes">
                <Search className="mr-1 h-4 w-4" aria-hidden="true" />
                Search Topics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
