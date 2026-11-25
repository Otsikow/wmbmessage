import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Music, Hash, Download, Share2, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { loadSongs, songPath, songQuery, songReference, songSectionLabel } from "@/services/songService";
import type { Song, SongSection } from "@/types/songs";
import {
  arrangementLabel, arrangementOptions, browseSongs, buildSongCatalogue,
  type SongCollection, type SongEntry, type SongOrder, type SongResult,
} from "@/lib/songCatalogue";
import { downloadSongPdf, songToPlainText } from "@/lib/songExport";
import { buildShareUrl, BRAND_NAME } from "@/lib/share";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";


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
  const isChorus = section.type === "chorus" || section.type === "refrain";
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
          {songSectionLabel(section, index)}
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

function SongReader({ entry, arrangement, onSelect }: {
  entry: SongEntry;
  arrangement: Song;
  onSelect: (song: Song) => void;
}) {
  const song = { ...arrangement, title: entry.title };
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  let verseCount = 0;

  const handleShare = async () => {
    const url = buildShareUrl(songPath(song));
    const text = songToPlainText(song);
    const shareData = {
      title: song.title,
      text,
      url,
    };

    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share(shareData);
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.title}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Song link copied to your clipboard." });
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Try downloading the PDF instead.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLyrics = async () => {
    try {
      await navigator.clipboard.writeText(songToPlainText(song));
      toast({ title: "Lyrics copied", description: "Full lyrics copied to clipboard." });
    } catch {
      toast({
        title: "Couldn't copy lyrics",
        description: "Please try again or download the PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = () => {
    try {
      downloadSongPdf(song);
      toast({ title: "PDF ready", description: `${song.title} downloaded.` });
    } catch (err) {
      console.error("PDF export failed", err);
      toast({
        title: "Download failed",
        description: "Couldn't generate the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <header className="mb-6 border-b border-border/50 pb-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Hash className="h-3 w-3" />
            {songReference(song)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              className="gap-1.5"
              aria-label={`Download ${song.title} as PDF`}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  aria-label={`Share ${song.title}`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLyrics}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy lyrics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
          {song.title}
        </h1>
        <p className="sr-only">From the {BRAND_NAME} song book.</p>
        {entry.arrangements.length > 1 ? (
          <label className="mt-4 grid max-w-full gap-1.5 text-sm font-medium sm:max-w-md">
            <span id="song-arrangement-label">Arrangement</span>
            <select
              aria-labelledby="song-arrangement-label"
              value={arrangement.id}
              onChange={(event) => {
                const selected = entry.arrangements.find((item) => item.id === event.target.value);
                if (selected) onSelect(selected);
              }}
              className="min-h-11 min-w-0 rounded-md border bg-background px-3 text-sm"
            >
              {arrangementOptions(entry).map(({ song: option, label }) => (
                <option key={option.id} value={option.id}>{label}</option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{arrangementLabel(arrangement)}</p>
        )}
      </header>

      <div className="space-y-4">
        {song.sections.map((section, idx) => {
          if (section.type === "verse") verseCount += 1;
          return (
            <SectionBlock
              key={idx}
              section={section}
              index={verseCount}
            />
          );
        })}
      </div>
    </article>
  );
}

function SongIndex({ results, selectedEntryId, grouped, onSelect }: {
  results: SongResult[];
  selectedEntryId?: string;
  grouped: boolean;
  onSelect: (song: Song) => void;
}) {
  if (!results.length) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">No songs match your search.</p>;
  }

  const groups = new Map<string, SongResult[]>();
  for (const result of results) {
    const initial = result.entry.title.normalize("NFD").replace(/^[\p{P}\s]+/u, "").charAt(0).toUpperCase();
    const label = grouped ? (/^\p{L}$/u.test(initial) ? initial : "#") : "";
    const group = groups.get(label);
    if (group) group.push(result);
    else groups.set(label, [result]);
  }

  return (
    <div className="space-y-4 px-4 py-4 md:px-2">
      {[...groups].map(([label, songs]) => (
        <div key={label}>
          {label && <h2 className="mb-1 px-3 text-sm font-semibold text-muted-foreground md:border-b md:py-1.5 md:text-xs">{label}</h2>}
          <ul className="divide-y overflow-hidden rounded-2xl border border-border/70 bg-card md:space-y-0.5 md:divide-y-0 md:rounded-none md:border-0 md:bg-transparent">
            {songs.map(({ entry, song }) => {
              const active = entry.id === selectedEntryId;
              const detail = entry.firstLine ?? (entry.arrangements.length > 1 ? `${entry.arrangements.length} arrangements` : null);
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(song)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:min-h-12 md:rounded-lg",
                      active ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="inline-flex h-7 min-w-8 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-semibold tabular-nums text-muted-foreground">
                      {song.number ?? <Music className="h-3.5 w-3.5" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-base font-medium leading-snug md:text-sm">
                      {entry.title}
                      {detail && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{detail}</span>}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground md:hidden" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Songs() {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<SongCollection>("all");
  const [order, setOrder] = useState<SongOrder>("title");
  const [listLimit, setListLimit] = useState(80);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // On mobile, toggle between the list and the reader so the song
  // isn't pushed below the full list when selected.
  const [mobileView, setMobileView] = useState<"list" | "reader">("list");

  useEffect(() => {
    let cancelled = false;
    loadSongs()
      .then((data) => {
        if (cancelled) return;
        setSongs(data);
        const requested = searchParams.get("song");
        const initial =
          (requested && data.find((s) => s.id === requested || (s.collection !== "presenter" && String(s.number) === requested))) ||
          data[0];
        if (initial) {
          setSelectedId(initial.id);
          // If a song was requested via URL, open the reader on mobile too.
          if (requested) setMobileView("reader");
        }
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

  useEffect(() => {
    if (!searchParams.has("song")) setMobileView("list");
  }, [searchParams]);

  const catalogue = useMemo(() => buildSongCatalogue(songs ?? []), [songs]);
  const filtered = useMemo(
    () => browseSongs(catalogue, query, collection, order),
    [catalogue, query, collection, order],
  );
  const selectedEntry = selectedId ? catalogue.bySong.get(selectedId) : undefined;
  const selected = selectedEntry?.arrangements.find((song) => song.id === selectedId);

  const handleSelect = (song: Song) => {
    setSelectedId(song.id);
    setSearchParams(songQuery(song), { replace: true });
    setMobileView("reader");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleBackToList = () => {
    setMobileView("list");
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("song");
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const showListOnMobile = mobileView === "list";
  const showReaderOnMobile = mobileView === "reader";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header className={showReaderOnMobile && selected ? "hidden md:block" : undefined} />

      <main className="flex-1 pb-20 md:pb-8">
        {/* Search bar — hidden on mobile while the reader is open to maximise reading space */}
        <div
          className={cn(
            "border-b border-border/60 bg-background",
            showReaderOnMobile && "hidden md:block",
          )}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-[2rem] font-bold leading-tight tracking-tight md:text-2xl">Song Book</h1>
              <span className="text-xs text-muted-foreground">
                {songs ? `${catalogue.entries.length.toLocaleString()} songs` : ""}
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setListLimit(80); }}
                placeholder="Search by number, title, or a line of lyrics…"
                className="h-11 rounded-xl border-transparent bg-muted pl-9 text-base"
                inputMode="search"
                aria-label="Search songs"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 content-end gap-3 sm:flex sm:flex-wrap sm:items-end">
              <label className="grid gap-1 text-sm">
                Collection
                <select
                  value={collection}
                  onChange={(event) => { setCollection(event.target.value as SongCollection); setListLimit(80); }}
                  className="h-11 min-w-0 rounded-md border bg-background px-2"
                >
                  <option value="all">All songs</option>
                  <option value="presenter">Church Presenter</option>
                  <option value="fellowship">Fellowship Song Book</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Sort by
                <select
                  value={order}
                  onChange={(event) => { setOrder(event.target.value as SongOrder); setListLimit(80); }}
                  className="h-11 min-w-0 rounded-md border bg-background px-2"
                >
                  <option value="title">Title A–Z</option>
                  <option value="number">Hymn number</option>
                </select>
              </label>
              {songs && <p role="status" className="col-span-2 text-sm text-muted-foreground sm:pb-2">{filtered.length.toLocaleString()} {filtered.length === 1 ? "song" : "songs"}</p>}
            </div>
            {songs && !songs.some((song) => song.collection === "presenter") && (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                Church Presenter songs are temporarily unavailable.
              </p>
            )}
          </div>
        </div>

        {/* Mobile-only back bar when reading a song */}
        {showReaderOnMobile && selected && (
          <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/95 px-3 pb-1 pt-[calc(0.25rem+env(safe-area-inset-top,0px))] backdrop-blur-xl md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-1 px-1 font-semibold text-primary"
              aria-label="Back to song list"
            >
              <ChevronLeft aria-hidden="true" />
              All songs
            </Button>
            <span className="ml-auto truncate text-xs font-medium text-muted-foreground">
              {songReference(selected)}
            </span>
          </div>
        )}

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
              <aside
                className={cn(
                  "border-b border-border/50 md:block md:border-b-0 md:border-r md:pr-2 md:sticky md:top-28 md:self-start md:h-[calc(100dvh-8rem)]",
                  showListOnMobile ? "block" : "hidden",
                )}
              >
                <ScrollArea className="md:h-full">
                  <SongIndex
                    results={filtered.slice(0, listLimit)}
                    selectedEntryId={selectedEntry?.id}
                    grouped={!query.trim() && order === "title"}
                    onSelect={handleSelect}
                  />
                  {filtered.length > listLimit && (
                    <Button variant="outline" className="m-2" onClick={() => setListLimit((value) => value + 80)}>
                      Show more songs
                    </Button>
                  )}
                </ScrollArea>
              </aside>

              {/* Reader */}
              <section
                className={cn(
                  "min-h-[40vh] md:block",
                  showReaderOnMobile ? "block" : "hidden",
                )}
              >
                {selected && selectedEntry ? (
                  <SongReader
                    entry={selectedEntry}
                    arrangement={selected}
                    onSelect={(arrangement) => {
                      setSelectedId(arrangement.id);
                      setSearchParams(songQuery(arrangement), { replace: true });
                    }}
                  />
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
      <Navigation />
    </div>
  );
}
