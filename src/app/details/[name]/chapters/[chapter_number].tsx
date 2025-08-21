"use client";
import React from 'react';
import { useParams } from 'next/navigation';

// Minimal debug view: display only the dynamic chapter number from the route.
export default function ChapterDetailsPage() {
  const params = useParams();
  const chapter_number = params?.chapter_number as string;
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-4xl font-bold tracking-tight">{chapter_number}</div>
    </main>
  );
}
