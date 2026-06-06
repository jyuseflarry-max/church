"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = {
  id: string;
  full_name: string | null;
  current_address: string | null;
  cell_phone: string | null;
  home_phone: string | null;
};

type SearchState = "idle" | "loading" | "ready" | "error";

export default function BenevolenceSearch() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setState("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setState("loading");
      try {
        const response = await fetch(
          `/api/benevolence/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const payload = (await response.json()) as { results?: SearchResult[] };
        setResults(payload.results ?? []);
        setState("ready");
        setIsOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setState("error");
          setIsOpen(true);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = results[0];
    if (firstResult) {
      router.push(`/benevolence/people/${firstResult.id}`);
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md print:hidden">
      <form onSubmit={submitSearch}>
        <label className="sr-only" htmlFor="benevolence-household-search">
          Search household names
        </label>
        <input
          id="benevolence-household-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder="Search household name..."
          autoComplete="off"
          className="h-10 w-full rounded-md border border-sage-muted bg-white px-3 text-sm text-charcoal outline-none focus:border-sage focus:ring-2 focus:ring-sage-muted"
        />
      </form>

      {isOpen && query.trim().length >= 2 ? (
        <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-md border border-sage-muted bg-white shadow-lg">
          {state === "loading" ? (
            <div className="px-3 py-2 text-sm text-muted">Searching...</div>
          ) : state === "error" ? (
            <div className="px-3 py-2 text-sm font-semibold text-rose-dark">
              Search is unavailable.
            </div>
          ) : results.length ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/benevolence/people/${result.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block border-b border-sage-muted px-3 py-2 last:border-b-0 hover:bg-sage-muted"
                >
                  <div className="text-sm font-semibold text-sage-deep">
                    {result.full_name ?? "Unknown household"}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {result.current_address || "No address recorded"}
                  </div>
                  <div className="mt-0.5 text-xs text-charcoal">
                    {result.cell_phone || result.home_phone || "No phone recorded"}
                  </div>
                </Link>
              ))}
            </div>
          ) : state === "ready" ? (
            <div className="px-3 py-2 text-sm text-muted">No matching households.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
