import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Music, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { loadSongs, searchSongs } from "@/services/songService";
import type { Song, SongSection } from "@/types/songs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


function splitIntoStanzas(lines: string[]): string[] {
  const normalizedLines = lines.map((line) => line.trimEnd());
  const hasBlankSeparators = normalizedLines.some((line) => line.trim() === "");

  if (hasBlankSeparators) {
    const stanzas: string[] = [];
    let current: string[] = [];

    for (const line of normalizedLines) {
      if (!line.trim()) {
        if (current.length) {
          stanzas.push(current.join("\n"));
          current = [];
        }
        continue;
      }
      current.push(line);
    }

    if (current.length) stanzas.push(current.join("\n"));
    return stanzas;
  }

  if (normalizedLines.length <= 6) {
    return [normalizedLines.join("\n")];
  }

  const stanzaLength = normalizedLines.length % 4 === 0 ? 4 : 8;
  const stanzas: string[] = [];
  for (let i = 0; i < normalizedLines.length; i += stanzaLength) {
    stanzas.push(normalizedLines.slice(i, i + stanzaLength).join("\n"));
  }
  return stanzas;
}
function SectionBlock({ section, index }: { section: SongSection; index: number }) {
  const isChorus = section.type === "chorus";
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-4 sm:px-6 sm:py-5 transition-colors",
        isChorus
          ? "bg-primary/10 border-l-4 border-primary shadow-sm"
          : "bg-card/40 border border-border/40",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            isChorus ? "text-primary" : "text-muted-foreground",
          )}
        >
          {section.label ?? (isChorus ? "Chorus" : `Verse ${index}`)}
        </span>
      </div>
      <div
        className={cn(
          "whitespace-pre-line leading-relaxed text-foreground",
          "text-[17px] sm:text-[18px]",
          isChorus && "font-medium italic",
        )}
      >
        {splitIntoStanzas(section.lines).map((stanza, stanzaIndex) => (
          <p key={stanzaIndex} className="mb-4 last:mb-0">
            {stanza}
          </p>
        ))}
      </div>
    </div>
  );
}

function SongReader({ song }: { song: Song }) {
  let verseCount = 0;
  return (
    <article className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <header className="mb-6 border-b border-border/50 pb-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Hash className="h-3 w-3" />
          Song {song.number}
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
          {song.title}
        </h1>
      </header>

      <div className="space-y-4">
        {song.sections.map((section, idx) => {
          if (section.type !== "chorus") verseCount += 1;
          return (
            <SectionBlock
              key={idx}
              section={section}
              index={section.type === "chorus" ? idx : verseCount}
            />
          );
        })}
      </div>
    </article>
  );
}

function SongIndex({
  songs,
  selectedId,
  onSelect,
}: {
  songs: Song[];
  selectedId: string | null;
  onSelect: (song: Song) => void;
}) {
  if (!songs.length) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        No songs match your search.
      </div>
    );
  }
  return (
    <ul className="space-y-1 p-2">
      {songs.map((song) => {
        const isActive = song.id === selectedId;
        return (
          <li key={song.id}>
            <button
              type="button"
              onClick={() => onSelect(song)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-background",
                )}
              >
                {song.number}
              </span>
              <span className="flex-1 text-sm font-medium leading-tight">
                {song.title}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function Songs() {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSongs()
      .then((data) => {
        if (cancelled) return;
        setSongs(data);
        const requested = searchParams.get("song");
        const initial =
          (requested && data.find((s) => s.id === requested || String(s.number) === requested)) ||
          data[0];
        if (initial) setSelectedId(initial.id);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load songs", err);
        setError("We couldn't load the song book. Please try again.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!songs) return [];
    return searchSongs(songs, query);
  }, [songs, query]);

  const selected = useMemo(
    () => songs?.find((s) => s.id === selectedId) ?? null,
    [songs, selectedId],
  );

  const handleSelect = (song: Song) => {
    setSelectedId(song.id);
    setSearchParams({ song: String(song.number) }, { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        <div className="border-b border-border/50 bg-card/30 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Song Book</h2>
              <span className="text-xs text-muted-foreground">
                {songs ? `${songs.length} songs` : ""}
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by number, title, or a line of lyrics…"
                className="h-11 pl-9 text-base"
                inputMode="search"
                aria-label="Search songs"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-auto max-w-2xl px-4 py-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {!songs && !error && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
              <Skeleton className="h-[60vh] w-full" />
              <Skeleton className="h-[60vh] w-full" />
            </div>
          </div>
        )}

        {songs && (
          <div className="mx-auto max-w-7xl px-0 sm:px-6">
            <div className="grid gap-0 md:grid-cols-[280px_1fr] md:gap-6 lg:grid-cols-[320px_1fr]">
              {/* Index */}
              <aside className="border-b border-border/50 md:border-b-0 md:border-r md:pr-2">
                <ScrollArea className="md:h-[calc(100dvh-220px)]">
                  <SongIndex
                    songs={filtered}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                  />
                </ScrollArea>
              </aside>

              {/* Reader */}
              <section className="min-h-[40vh]">
                {selected ? (
                  <SongReader song={selected} />
                ) : (
                  <div className="px-4 py-12 text-center text-muted-foreground">
                    Select a song to start.
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
