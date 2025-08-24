import React, { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
  // Utility to format title
  function formatTitle(str: string) {
    return str.replace(/-/g, ' ').replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  // Example: <title>{formatTitle('Search')}</title>
}
