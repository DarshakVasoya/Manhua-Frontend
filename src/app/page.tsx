import React, { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function HomePage() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
  // Utility to format title
  function formatTitle(str: string) {
    return str.replace(/-/g, ' ').replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
