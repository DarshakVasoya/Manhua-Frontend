"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = 'http://165.232.60.4:8000/manhwa';

export default function DetailsPage() {
  const params = useParams();
  const name = params?.name as string;
  const [details, setDetails] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    if (!name) return;
    fetch(`${API_BASE}/${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => setDetails(data));
    fetch(`${API_BASE}/${encodeURIComponent(name)}/chapters`)
      .then(res => res.json())
      .then(data => setChapters(data));
  }, [name]);

  if (!details) return <div className="text-center text-sm text-[var(--color-text-dim)] p-8">Loading...</div>;

  return (
    <main className="container-page max-w-5xl mx-auto">
      <nav className="text-xs mb-4 text-[var(--color-text-dim)] flex gap-1"> <a href="/" className="hover:text-white">Home</a> <span>/</span> <span className="truncate max-w-[260px]">{name}</span></nav>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 flex flex-col md:flex-row items-start gap-8 mb-8">
        {details.cover_image && (
          <div className="w-56 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={details.cover_image} alt={details.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{details.name}</h1>
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {details.rating && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-amber-300 font-semibold">⭐ {details.rating}</span>}
            {details.last_chapter && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-emerald-300 font-medium">{details.last_chapter}</span>}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text-dim)] whitespace-pre-line max-w-prose">{details.description}</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-3">Chapters <span className="text-[var(--color-text-dim)] font-normal">({chapters.length})</span></h2>
      <div className="grid sm:grid-cols-2 gap-2 mb-12">
        {chapters.map((ch: any) => (
          <a key={ch.chapter_number} href={`/details/${encodeURIComponent(name)}/chapters/${ch.chapter_number}`} className="px-3 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs flex items-center justify-between hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition group">
            <span className="font-medium group-hover:text-white">Chapter {ch.chapter_number}</span>
            {ch.title && <span className="text-[var(--color-text-dim)] truncate max-w-[150px] ml-2">{ch.title}</span>}
          </a>
        ))}
      </div>
    </main>
  );
}
