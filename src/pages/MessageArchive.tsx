import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  archivePath,
  filterMessageCatalog,
  loadMessageBatch,
  type ArchivedMessage,
  type MessageEntry,
  type MessageMatch,
} from "@/lib/messageArchive";

const PAGE_SIZE = 40;

function Transcript({ entry, paragraph }: { entry: MessageEntry; paragraph: string | null }) {
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

  useEffect(() => {
    if (!message || paragraph === null) return;
    const match = document.getElementById(`message-paragraph-${paragraph}`);
    match?.focus({ preventScroll: true });
    match?.scrollIntoView({ block: "center" });
  }, [message, paragraph]);

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
      ) : message ? (
        <ol className="space-y-4">
          {message[2].map(([number, text], index) => {
            const current = String(index) === paragraph;
            return (
              <li
                key={index}
                id={`message-paragraph-${index}`}
                tabIndex={current ? -1 : undefined}
                className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 rounded-lg p-2 leading-relaxed ${current ? "bg-primary/10" : ""}`}
              >
                <span className="select-none text-sm tabular-nums text-muted-foreground">¶ {number || index + 1}</span>
                <p className="whitespace-pre-line">{text}</p>
              </li>
            );
          })}
        </ol>
      ) : <p role="status">Loading transcript…</p>}
    </article>
  );
}

export default function MessageArchive() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const scope = params.get("scope") === "text" ? "text" : "catalog";
  const code = params.get("message");
  const paragraph = params.get("paragraph");
  const [catalog, setCatalog] = useState<MessageEntry[]>();
  const [catalogError, setCatalogError] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [input, setInput] = useState(query);
  const [mode, setMode] = useState(scope);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [searchResult, setSearchResult] = useState<{ query: string; matches: MessageMatch[] }>();
  const [progress, setProgress] = useState(0);
  const [searchError, setSearchError] = useState(false);
  const [searchRetry, setSearchRetry] = useState(0);
  const files = useMemo(() => [...new Set(catalog?.map((entry) => entry.file))], [catalog]);
  const fullText = scope === "text" && Boolean(query.trim());
  const matches = searchResult?.query === query ? searchResult.matches : undefined;
  const shouldSearch = fullText && !code && files.length > 0 && !matches;

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
        if (data.type === "results") setSearchResult({ query, matches: data.results });
        if (data.type === "error") setSearchError(true);
      };
      worker.postMessage({ files, query });
    } catch {
      setSearchError(true);
    }
    return () => worker?.terminate();
  }, [files, query, searchRetry, shouldSearch]);

  const entry = catalog?.find((item) => item.code === code);
  const titles = useMemo(() => filterMessageCatalog(catalog ?? [], query), [catalog, query]);
  const results = fullText ? matches : titles;
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
            {entry ? <Transcript key={entry.code} entry={entry} paragraph={paragraph} />
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
              if (mode === "text") next.set("scope", "text");
              setParams(next);
            }}>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="message-scope" checked={mode === "catalog"} onChange={() => setMode("catalog")} />
                  Title or date code
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="message-scope" checked={mode === "text"} onChange={() => setMode("text")} />
                  Words in a transcript
                </label>
              </div>
              <div className="flex gap-2">
                <Input
                  type="search"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Search William Branham messages"
                  placeholder={mode === "text" ? "Enter a phrase" : "Enter a title or date code"}
                  maxLength={160}
                />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  Search
                </Button>
              </div>
            </form>

            {searchError ? (
              <div role="alert" className="space-y-3">
                <p>Couldn’t finish searching the transcripts.</p>
                <Button variant="outline" onClick={() => setSearchRetry((value) => value + 1)}>Try again</Button>
              </div>
            ) : !catalog ? <p role="status">Loading messages…</p>
              : !results ? (
                <div role="status" className="space-y-2">
                  <p>Searching transcripts…</p>
                  <progress aria-label="Transcript search progress" max={files.length} value={progress} className="w-full" />
                </div>
              ) : (
                <>
                  <p role="status" className="text-sm text-muted-foreground">
                    {results.length ? `${results.length.toLocaleString()} messages` : "No matching messages"}
                  </p>
                  {results.length > 0 && <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                    {results.slice(0, limit).map((result) => (
                      <li key={result.code}>
                        <Link to={messageLink(result)} className="block p-4 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                          <p className="text-xs font-semibold text-primary">
                            {result.code}{"number" in result && result.number ? ` · ¶ ${result.number}` : ""}
                          </p>
                          <p className="mt-1 font-semibold">{result.title}</p>
                          {"excerpt" in result && <p className="mt-1 text-sm text-muted-foreground">{result.excerpt}</p>}
                        </Link>
                      </li>
                    ))}
                  </ul>}
                  {results.length > limit && (
                    <Button variant="outline" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                      Show more messages
                    </Button>
                  )}
                </>
              )}
          </>
        )}
      </main>
      <Footer />
      <Navigation />
    </div>
  );
}
