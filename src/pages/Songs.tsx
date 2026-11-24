import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Music, Hash, Download, Share2, Copy, Check, ArrowLeft } from "lucide-react";
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
import { loadSongs, searchSongs, songPath, songQuery, songReference, songSectionLabel } from "@/services/songService";
import type { Song, SongSection } from "@/types/songs";
import { downloadSongPdf, songToPlainText } from "@/lib/songExport";
import { buildShareUrl, BRAND_NAME } from "@/lib/share";
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

function SongReader({ song }: { song: Song }) {
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
              aria-current={isActive ? "true" : undefined}
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
                {song.number ?? <Music className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              <span className="flex-1 text-sm font-medium leading-tight">
                {song.title}
                <span className={cn("mt-1 block text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {song.collection === "presenter" ? "Church Presenter" : "Fellowship Song Book"}
                </span>
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
  const [collection, setCollection] = useState("all");
  const [order, setOrder] = useState("title");
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

  const filtered = useMemo(() => {
    if (!songs) return [];
    const available = songs.filter((song) => collection === "all" || (song.collection ?? "fellowship") === collection);
    const sorted = available.sort((a, b) =>
      (order === "number" ? (a.number ?? Infinity) - (b.number ?? Infinity) : 0) ||
      a.title.localeCompare(b.title),
    );
    return searchSongs(sorted, query);
  }, [songs, query, collection, order]);

  const selected = useMemo(
    () => songs?.find((s) => s.id === selectedId) ?? null,
    [songs, selectedId],
  );

  const handleSelect = (song: Song) => {
    setSelectedId(song.id);
    setSearchParams(songQuery(song), { replace: true });
    setMobileView("reader");
    // Bring the reader content into view on mobile.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToList = () => {
    setMobileView("list");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const showListOnMobile = mobileView === "list";
  const showReaderOnMobile = mobileView === "reader";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />

      <main className="flex-1 pb-20 md:pb-8">
        {/* Search bar — hidden on mobile while the reader is open to maximise reading space */}
        <div
          className={cn(
            "border-b border-border/50 bg-card/30 backdrop-blur",
            showReaderOnMobile && "hidden md:block",
          )}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Song Book</h1>
              <span className="text-xs text-muted-foreground">
                {songs ? `${songs.length} songs` : ""}
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setListLimit(80); }}
                placeholder="Search by number, title, or a line of lyrics…"
                className="h-11 pl-9 text-base"
                inputMode="search"
                aria-label="Search songs"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-sm">
                Collection
                <select
                  value={collection}
                  onChange={(event) => { setCollection(event.target.value); setListLimit(80); }}
                  className="h-10 rounded-md border bg-background px-2"
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
                  onChange={(event) => { setOrder(event.target.value); setListLimit(80); }}
                  className="h-10 rounded-md border bg-background px-2"
                >
                  <option value="title">Title A–Z</option>
                  <option value="number">Hymn number</option>
                </select>
              </label>
              {songs && <p role="status" className="pb-2 text-sm text-muted-foreground">{filtered.length.toLocaleString()} shown in results</p>}
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
          <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/50 bg-background/95 px-3 py-2 backdrop-blur md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-1.5 px-2"
              aria-label="Back to song list"
            >
              <ArrowLeft className="h-4 w-4" />
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
                    songs={filtered.slice(0, listLimit)}
                    selectedId={selectedId}
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
