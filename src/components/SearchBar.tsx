"use client";

import React, { useState } from "react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  className = "",
  placeholder = "Search...",
}: SearchBarProps) {
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (query) window.location.href = `/search?query=${encodeURIComponent(query)}`;
      }}
      role="search"
      aria-label="Global search"
      className={`items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md focus-within:border-[var(--color-accent)] transition min-w-0 w-auto relative ${className}`}
    >
      <input
        name="q"
        type="text"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="bg-transparent px-3 py-2 text-sm flex-1 min-w-0 outline-none w-full"
      />
      <button
        type="submit"
        className="px-3 py-2 text-xs font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
      >
        Go
      </button>
    </form>
  );
}