import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, List, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  archivePath,
  filterMessageCatalog,
  findTranscriptParagraphs,
  highlightMessageText,
  loadMessageBatch,
  messageDateCode,
  type ArchivedMessage,
  type MessageEntry,
  type MessageMatch,
} from "@/lib/messageArchive";

const PAGE_SIZE = 40;
const MATCH_PAGE_SIZE = 6;
type SearchScope = "all" | "catalog" | "text";
const SEARCH_SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "catalog", label: "Titles and dates" },
  { value: "text", label: "Transcript text" },
];

function Highlight({ text, query }: { text: string; query: string }) {
  return highlightMessageText(text, query).map(({ text: part, match }, index) => match
    ? <mark key={index} className="rounded-sm bg-amber-200 text-amber-950 dark:bg-amber-300">{part}</mark>
    : part);
}

function TranscriptBody({ message, paragraph, query }: { message: ArchivedMessage; paragraph: string | null; query: string }) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<(ReturnType<typeof findTranscriptParagraphs> & { index: number })>();
  const [matchLimit, setMatchLimit] = useState(MATCH_PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const activeMatch = search?.matches[search.index]?.paragraph;
  const matchCount = search?.matches.length ?? 0;
  const status = search && (matchCount
    ? `${matchCount} matching paragraph${matchCount === 1 ? "" : "s"}`
    : "No matching paragraphs in this message.");

  const focusSearch = () => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
  };

  useEffect(() => {
    if (paragraph === null) return;
    const target = document.getElementById(`message-paragraph-${paragraph}`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "center" });
  }, [paragraph]);

  useEffect(() => {
    if (activeMatch === undefined) return;
    const target = document.getElementById(`message-paragraph-${activeMatch}`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [activeMatch, search]);

  return (
    <>
      <form className="space-y-2 rounded-xl border bg-background/60 p-3 sm:p-4" onSubmit={(event) => {
        event.preventDefault();
        const value = input.trim();
        setMatchLimit(MATCH_PAGE_SIZE);
        setSearch(value ? { ...findTranscriptParagraphs(message, value), index: 0 } : undefined);
      }}>
        <label htmlFor="transcript-search" className="text-sm font-semibold">Find in this message</label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            ref={inputRef}
            id="transcript-search"
            type="search"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (!event.target.value.trim()) setSearch(undefined);
            }}
            maxLength={1000}
            placeholder="Paragraph number, words, or a quote"
            aria-describedby="transcript-search-hint"
            className="min-w-0 flex-1 text-base"
          />
          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" />
            Find
          </Button>
        </div>
        <p id="transcript-search-hint" className="text-xs text-muted-foreground">
          Enter a number to jump to a paragraph. Use quotation marks for an exact phrase.
        </p>
        <p role="status" className={search && !matchCount ? "text-sm text-muted-foreground" : "sr-only"}>
          {status}
        </p>
      </form>
      {search && matchCount > 0 && (
        <section aria-labelledby="transcript-results" className="space-y-3 rounded-xl border bg-background/60 p-3 sm:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="transcript-results" ref={resultsRef} tabIndex={-1} className="scroll-mt-28 text-sm font-semibold">
              Search results
            </h2>
            <span className="text-xs text-muted-foreground">{status}</span>
          </div>
          <ul className="divide-y overflow-hidden rounded-lg border bg-card">
            {search.matches.slice(0, matchLimit).map((match, index) => (
              <li key={match.paragraph}>
                <button
                  type="button"
                  aria-current={index === search.index ? "true" : undefined}
                  onClick={() => setSearch({ ...search, index })}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-[current=true]:bg-primary/10"
                >
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block text-xs font-semibold text-primary">Paragraph {match.number || match.paragraph + 1}</span>
                    <span className="line-clamp-2 break-words text-sm leading-relaxed text-foreground/85">
                      <Highlight text={match.excerpt} query={search.query} />
                    </span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {matchLimit < matchCount && (
            <Button type="button" variant="outline" size="sm" onClick={() => {
              setMatchLimit(matchLimit + MATCH_PAGE_SIZE);
              requestAnimationFrame(() => {
                resultsRef.current?.closest("section")?.querySelectorAll<HTMLButtonElement>("li button")[matchLimit]?.focus();
              });
            }}>
              Show more matches ({matchCount - matchLimit})
            </Button>
          )}
        </section>
      )}
      <ol className="space-y-4">
        {message[2].map(([number, text], index) => {
          const localMatch = index === activeMatch;
          const current = localMatch || (!search && String(index) === paragraph);
          return (
            <li
              key={index}
              id={`message-paragraph-${index}`}
              tabIndex={current ? -1 : undefined}
              className={`grid scroll-mt-28 grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2 gap-y-2 rounded-lg leading-relaxed ${localMatch ? "border border-primary/30 bg-primary/5 p-3 shadow-sm sm:p-4" : current ? "bg-primary/10 p-2" : "p-2"}`}
            >
              {localMatch && search && (
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-primary/20 pb-2">
                  <div className="mr-auto">
                    <p className="text-sm font-semibold text-primary">Paragraph {number || index + 1}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      Match {search.index + 1} of {matchCount}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={matchCount === 1 ? focusSearch : () => {
                      setMatchLimit((limit) => Math.max(limit, search.index + 1));
                      resultsRef.current?.focus({ preventScroll: true });
                      resultsRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
                    }}
                  >
                    {matchCount === 1 ? <Search aria-hidden="true" /> : <List aria-hidden="true" />}
                    {matchCount === 1 ? "Back to search" : "All matches"}
                  </Button>
                  {matchCount > 1 && (
                    <div role="group" aria-label="Match navigation" className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Previous match"
                        disabled={search.index === 0}
                        onClick={() => setSearch({ ...search, index: search.index - 1 })}
                      >
                        <ChevronLeft aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Next match"
                        disabled={search.index + 1 === matchCount}
                        onClick={() => setSearch({ ...search, index: search.index + 1 })}
                      >
                        <ChevronRight aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {!localMatch && <span className="select-none text-sm tabular-nums text-muted-foreground">¶ {number || index + 1}</span>}
              <p className={`whitespace-pre-line break-words ${localMatch ? "col-span-2 pt-1" : ""}`}>
                {current ? <Highlight text={text} query={localMatch ? search.query : query} /> : text}
              </p>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function Transcript({ entry, paragraph, query }: { entry: MessageEntry; paragraph: string | null; query: string }) {
  const [message, setMessage] = useState<ArchivedMessage>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadMessageBatch(entry.file, controller.signal)
      .then((messages) => {
        if (controller.signal.aborted) return;
        const found = messages.find(([code]) => code === entry.code);
        if (found) setMessage(found);
        else setError(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [entry, retry]);

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-card p-5 sm:p-8">
      <header>
        <p className="text-sm font-semibold text-primary">{entry.code}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{entry.title}</h1>
      </header>
      {error ? (
        <div role="alert" className="space-y-3">
          <p>Couldn’t load this transcript.</p>
          <Button variant="outline" onClick={() => { setError(false); setRetry((value) => value + 1); }}>
            Try again
          </Button>
        </div>
      ) : message ? <TranscriptBody message={message} paragraph={paragraph} query={query} />
        : <p role="status">Loading transcript…</p>}
    </article>
  );
}

export default function MessageArchive() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").slice(0, 160);
  const requestedScope = params.get("scope");
  const scope: SearchScope = requestedScope === "text" || requestedScope === "catalog" ? requestedScope : "all";
  const code = params.get("message");
  const paragraph = params.get("paragraph");
  const [catalog, setCatalog] = useState<MessageEntry[]>();
  const [catalogError, setCatalogError] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [input, setInput] = useState(query);
  const [mode, setMode] = useState(scope);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [searchResult, setSearchResult] = useState<{ query: string; matches: MessageMatch[]; total: number }>();
  const [progress, setProgress] = useState(0);
  const [searchError, setSearchError] = useState(false);
  const [searchRetry, setSearchRetry] = useState(0);
  const files = useMemo(() => [...new Set(catalog?.map((entry) => entry.file))], [catalog]);
  const titles = useMemo(() => filterMessageCatalog(catalog ?? [], query), [catalog, query]);
  const searchTranscripts = Boolean(query.trim()) && (
    scope === "text" || (scope === "all" && !(messageDateCode(query) && titles.length))
  );
  const transcriptResults = searchTranscripts && searchResult?.query === query ? searchResult : undefined;
  const shouldSearch = searchTranscripts && !code && files.length > 0 && !transcriptResults;
  const searching = searchTranscripts && !transcriptResults && !searchError;
  const results = [...(scope === "text" && query.trim() ? [] : titles), ...(transcriptResults?.matches ?? [])];

  useEffect(() => {
    const controller = new AbortController();
    fetch(archivePath + "catalog.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load catalogue");
        return response.json() as Promise<MessageEntry[]>;
      })
      .then((entries) => setCatalog(entries))
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError(true);
      });
    return () => controller.abort();
  }, [catalogRetry]);

  useEffect(() => {
    setInput(query);
    setMode(scope);
    setLimit(PAGE_SIZE);
  }, [query, scope]);

  useEffect(() => {
    if (!shouldSearch) return;
    let worker: Worker | undefined;
    setProgress(0);
    setSearchError(false);
    try {
      worker = new Worker(new URL("../lib/messageArchive.worker.ts", import.meta.url), { type: "module" });
      worker.onerror = () => setSearchError(true);
      worker.onmessage = ({ data }) => {
        if (data.type === "progress") setProgress(data.completed);
        if (data.type === "results") setSearchResult({ query, matches: data.results, total: data.total });
        if (data.type === "error") setSearchError(true);
      };
      worker.postMessage({ files, query });
    } catch {
      setSearchError(true);
    }
    return () => worker?.terminate();
  }, [files, query, searchRetry, shouldSearch]);

  const entry = catalog?.find((item) => item.code === code);
  const backParams = new URLSearchParams(params);
  backParams.delete("message");
  backParams.delete("paragraph");

  const messageLink = (result: MessageEntry | MessageMatch) => {
    const next = new URLSearchParams(backParams);
    next.set("message", result.code);
    if ("paragraph" in result) next.set("paragraph", String(result.paragraph));
    return `?${next}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        {catalogError ? (
          <div role="alert" className="space-y-3">
            <p>Couldn’t load the message archive.</p>
            <Button variant="outline" onClick={() => { setCatalogError(false); setCatalogRetry((value) => value + 1); }}>
              Try again
            </Button>
          </div>
        ) : code ? (
          <>
            <Button asChild variant="outline">
              <Link to={`?${backParams}`}>Back to messages</Link>
            </Button>
            {entry ? <Transcript key={entry.code} entry={entry} paragraph={paragraph} query={query} />
              : <p role="status">{catalog ? "This message isn’t in the archive." : "Loading message…"}</p>}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                <BookOpen className="text-primary" aria-hidden="true" />
                William Branham Messages
              </h1>
              <p className="text-muted-foreground">
                {catalog ? `${catalog.length.toLocaleString()} transcripts` : "Transcript archive"}
              </p>
            </div>

            <form className="space-y-3 rounded-xl border bg-card p-4" onSubmit={(event) => {
              event.preventDefault();
              const next = new URLSearchParams();
              if (input.trim()) next.set("q", input.trim());
              if (mode !== "all") next.set("scope", mode);
              setParams(next);
            }}>
              <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <legend className="sr-only">Search scope</legend>
                {SEARCH_SCOPES.map(({ value, label }) => (
                  <label key={value} className="inline-flex items-center gap-2">
                    <input type="radio" name="message-scope" checked={mode === value} onChange={() => setMode(value)} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <div className="flex gap-2">
                <Input
                  type="search"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Search William Branham messages"
                  placeholder={mode === "catalog" ? "Enter a title or date code" : "Enter a title, date, or words from a message"}
                  maxLength={160}
                />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  Search
                </Button>
              </div>
              {mode !== "catalog" && (
                <p className="text-sm text-muted-foreground">Use quotation marks to search for an exact phrase.</p>
              )}
            </form>

            {searchTranscripts && searchError && (
              <div role="alert" className="space-y-3">
                <p>Couldn’t finish searching the transcripts.</p>
                <Button variant="outline" onClick={() => setSearchRetry((value) => value + 1)}>Try again</Button>
              </div>
            )}
            {!catalog ? <p role="status">Loading messages…</p> : searching ? (
              <div role="status" className="space-y-2 text-sm text-muted-foreground">
                <p>Searching transcripts…</p>
                <progress aria-label="Transcript search progress" max={files.length} value={progress} className="w-full" />
              </div>
            ) : !(searchTranscripts && searchError && !results.length) && (
              <p role="status" className="text-sm text-muted-foreground">
                {results.length ? [
                  (scope !== "text" || !query.trim()) && titles.length
                    ? `${titles.length.toLocaleString()} ${titles.length === 1 ? "message" : "messages"}`
                    : null,
                  transcriptResults?.total
                    ? `${transcriptResults.total.toLocaleString()} matching ${transcriptResults.total === 1 ? "paragraph" : "paragraphs"}`
                    : null,
                ].filter(Boolean).join(" · ") : "No matching messages or paragraphs"}
              </p>
            )}
            {results.length > 0 && (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {results.slice(0, limit).map((result) => (
                  <li key={`${result.code}:${"paragraph" in result ? result.paragraph : "title"}`}>
                    <Link to={messageLink(result)} className="block p-4 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                      <p className="text-xs font-semibold text-primary">
                        {result.code}{"paragraph" in result ? ` · ¶ ${result.number || result.paragraph + 1}` : ""}
                      </p>
                      <p className="mt-1 font-semibold">{result.title}</p>
                      {"excerpt" in result && (
                        <p className="mt-1 text-sm text-muted-foreground"><Highlight text={result.excerpt} query={query} /></p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {results.length > limit && (
              <Button variant="outline" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                Show more results
              </Button>
            )}
            {transcriptResults && transcriptResults.total > transcriptResults.matches.length && (
              <p className="text-sm text-muted-foreground">
                The best {transcriptResults.matches.length.toLocaleString()} paragraph matches are available. Add more words to narrow your search.
              </p>
            )}
          </>
        )}
      </main>
      <Footer />
      <Navigation />
    </div>
  );
}
