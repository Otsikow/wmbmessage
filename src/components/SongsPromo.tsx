import { Link } from "react-router-dom";
import { Music, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Prominent home-page CTA for the Songs feature.
 * Highlights the full song book and offers fast actions.
 */
export default function SongsPromo() {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-8 shadow-elegant">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Music className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Song Book
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                Sing along with the full Song Book
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Hundreds of songs, fully searchable by number, title, or
                lyrics — formatted for clear, singable reading.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
            <Button asChild size="lg" className="min-h-[48px]">
              <Link to="/songs" aria-label="Open the Songs page">
                Open Songs
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-[48px]"
            >
              <Link to="/songs" aria-label="Search songs">
                <Search className="mr-1 h-4 w-4" aria-hidden="true" />
                Search lyrics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
