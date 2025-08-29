"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { mainGenres, subGenres, demographics, format, other } from "../constants/categories";

type SuggestionItem = { name: string; slug?: string };

// Simple in-memory client cache for suggestions (prefix -> items)
const suggestCache = new Map<string, { items: SuggestionItem[]; expiry: number }>();

const allGenres: string[] = [
  ...mainGenres,
  ...subGenres,
  ...demographics,
  ...format,
  ...other,
];

export type AdvancedSearchBarProps = {
  initialQuery?: string;
  onSearch: (filters: { query: string; genres: string[] }) => void;
  className?: string;
  autoFocus?: boolean;
};

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ initialQuery = "", onSearch, className, autoFocus = false }) => {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [query, setQuery] = useState<string>(initialQuery);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeSugIndex, setActiveSugIndex] = useState<number>(-1);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const inputWrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const handleGenreChange = (g: string) => {
    const next = genres.includes(g) ? genres.filter((x: string) => x !== g) : [...genres, g];
    setGenres(next);
    // Do not trigger search immediately; wait for submit/button click
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query: query.trim(), genres });
    setShowSuggestions(false);
    setActiveSugIndex(-1);
  };

  // (cleanup duplicated effect above)

  // Debounced suggestions based on query (manga name)
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSugIndex(-1);
      setIsSuggesting(false);
      return;
    }

    const controller = new AbortController();
    // Start debounce waiting indicator
    setIsSuggesting(true);
    const t = setTimeout(() => {
      const limit = 8;
      const key = q.toLowerCase();
      // Serve from client cache if fresh
      const cached = suggestCache.get(key);
      const now = Date.now();
      if (cached && cached.expiry > now) {
        setSuggestions(cached.items);
        setShowSuggestions(cached.items.length > 0);
        setActiveSugIndex(-1);
        setIsSuggesting(false);
        return;
      }

      const url = `https://api.manhwagalaxy.org/manhwa/suggest?prefix=${encodeURIComponent(q)}&limit=${limit}&fields=name,slug`;
      fetch(url, { signal: controller.signal })
        .then(async (res) => {
          if (res.status === 204) return { items: [], ttl: 60 };
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json: { items?: Array<{ name?: string; slug?: string }>; ttl?: number } | undefined) => {
          const rawItems: Array<{ name?: string; slug?: string }> = Array.isArray(json?.items) ? (json!.items as Array<{ name?: string; slug?: string }>) : [];
          const items: SuggestionItem[] = rawItems
            .map((it) => ({ name: String(it?.name ?? ""), slug: it?.slug ? String(it.slug) : undefined }))
            .filter((it: SuggestionItem) => it.name.length > 0)
            .slice(0, limit);
          const ttlSec = Number(json?.ttl) > 0 ? Number(json!.ttl) : 300;
          suggestCache.set(key, { items, expiry: Date.now() + ttlSec * 1000 });
          setSuggestions(items);
          setShowSuggestions(items.length > 0);
          setActiveSugIndex(-1);
          setIsSuggesting(false);
        })
        .catch(() => {
          // ignore abort or errors; just hide suggestions
          setSuggestions([]);
          setShowSuggestions(false);
          setActiveSugIndex(-1);
          setIsSuggesting(false);
        });
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    if (!showSuggestions) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(target)) {
        setShowSuggestions(false);
        setActiveSugIndex(-1);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showSuggestions]);

  const selectSuggestion = (item: SuggestionItem) => {
  const value = item.slug || item.name;
    setQuery(item.name);
    setShowSuggestions(false);
    setActiveSugIndex(-1);
    // Navigate directly to the details page for the selected manga (prefer slug)
  const href = `/details/${encodeURIComponent(value)}`;
    router.push(href);
  };

  return (
  <form
      className={`advancedsearch-bar ${className ?? ''}`}
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 0,
        background: "var(--color-bg)",
        borderRadius: 5,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "3px 4px",
        flexWrap: "wrap",
        position: "relative",
        border: "1px solid var(--color-border)",
        fontSize: "11px",
        width: "100%",
        maxWidth: "100%"
      }}
      // Disable native browser autofill history suggestions
      autoComplete="off"
    >
      {/* Genre Dropdown Button */}
      <div style={{ minWidth: 70, maxWidth: 150, marginRight: 10 }}>
        <button
          ref={buttonRef}
          type="button"
          className="dropdown-toggle"
          onClick={() => setOpenDropdown((v) => !v)}
          style={{
            width: "100%",
            cursor: "pointer",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "5px 10px",
            fontWeight: 600,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: openDropdown ? "0 2px 8px rgba(0,0,0,0.10)" : undefined,
            letterSpacing: 0.5,
            transition: "box-shadow 0.2s"
          }}
        >
          Genre
          <span id="filtercount" style={{ color: "#fff", marginLeft: 8, fontWeight: 700 }}>
            {genres.length === 0 ? "All" : genres.length}
          </span>
          <i className="fa fa-angle-down" />
        </button>
      </div>
  {/* Genre Dropdown Menu (matches searchbar width) */}
      {openDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            zIndex: 20,
            background: "var(--color-bg)",
            border: "0.5px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderRadius: 8,
            padding: 7,
            minWidth: "100%",
            width: "100%",
            maxWidth: "100%",
            left: 0,
            top: 34,
            maxHeight: 220,
            overflowY: "auto",
            display: "grid",
            gap: 4,
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth > 600
                ? "repeat(8, 1fr)"
                : "repeat(auto-fit, minmax(120px, 1fr))"
          }}
        >
          {allGenres.map((g: string) => {
            const selected = genres.includes(g);
            return (
              <label
                key={g}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: selected ? "var(--color-accent)" : "var(--color-bg-hover)",
                  color: selected ? "#fff" : "var(--color-text)",
                  borderRadius: 6,
                  padding: "2px 5px",
                  cursor: "pointer",
                  border: selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  fontSize: "11px",
                  fontWeight: 500,
                  boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
                  transition: "background 0.2s, border 0.2s, box-shadow 0.2s"
                }}
              >
                <input
                  className="genre-item"
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleGenreChange(g)}
                  style={{ marginRight: 6, width: 14, height: 14, accentColor: "var(--color-accent)" }}
                />
                {g}
              </label>
            );
          })}
        </div>
      )}
      {/* Text search input (press Enter to search) */}
      <div style={{ marginLeft: 10, flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div ref={inputWrapperRef} style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          padding: '0 2px',
          width: '100%',
          position: 'relative'
        }}>
          <input
            type="text"
            name="q"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSugIndex(i => (i + 1) % suggestions.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSugIndex(i => (i - 1 + suggestions.length) % suggestions.length);
              } else if (e.key === 'Enter') {
                if (activeSugIndex >= 0 && activeSugIndex < suggestions.length) {
                  e.preventDefault();
                  selectSuggestion(suggestions[activeSugIndex]);
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                setActiveSugIndex(-1);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: 12,
              outline: 'none',
              width: '100%',
              flex: 1
            }}
            aria-label="Search query"
          />
          <button
            type="submit"
            aria-label="Run search"
            title="Search"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-accent)',
              color: '#fff',
              border: '1px solid var(--color-accent)',
              borderRadius: 6,
              width: 34,
              height: 28,
              margin: '2px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Spinner dropdown when debouncing/fetching and no suggestions yet */}
          {isSuggesting && query.trim().length >= 2 && suggestions.length === 0 && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: 'absolute',
                top: 32,
                left: 0,
                right: 0,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                zIndex: 30,
                maxHeight: 120,
                overflow: 'hidden',
                padding: '6px 8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                <svg width="16" height="16" viewBox="0 0 50 50" aria-hidden="true">
                  <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="31.415 31.415">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
                <span>Searching…</span>
              </div>
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div
              role="listbox"
              aria-label="Search suggestions"
              style={{
                position: 'absolute',
                top: 32,
                left: 0,
                right: 0,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                zIndex: 30,
                maxHeight: 260,
                overflowY: 'auto'
              }}
            >
              {suggestions.map((item, idx) => (
                <div
                  key={(item.slug || item.name) + idx}
                  role="option"
                  aria-selected={activeSugIndex === idx}
                  onMouseDown={(e) => {
                    // prevent input blur before selection
                    e.preventDefault();
                    selectSuggestion(item);
                  }}
                  onMouseEnter={() => setActiveSugIndex(idx)}
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    background: activeSugIndex === idx ? 'var(--color-bg-hover, rgba(127,127,127,0.12))' : 'transparent',
                    color: 'var(--color-text)',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}