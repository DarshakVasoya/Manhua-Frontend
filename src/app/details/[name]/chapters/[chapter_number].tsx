"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = 'http://165.232.60.4:8000/manhwa';

export default function ChapterDetailsPage() {
  const params = useParams();
  const name = params?.name as string;
  const chapter_number = params?.chapter_number as string;
  const [chapter, setChapter] = useState<any>(null);

  useEffect(() => {
    if (!name || !chapter_number) return;
    fetch(`${API_BASE}/${encodeURIComponent(name)}/chapters/${chapter_number}`)
      .then(res => res.json())
      .then(data => setChapter(data));
  }, [name, chapter_number]);

  const [chapters, setChapters] = useState<any[]>([]);
  useEffect(()=>{
    if(!name) return;
    fetch(`${API_BASE}/${encodeURIComponent(name)}/chapters`).then(r=>r.json()).then(d=>setChapters(d||[]));
  },[name]);
  const idx = chapters.findIndex(c=> String(c.chapter_number)===String(chapter_number));
  const prev = idx>0 ? chapters[idx-1] : null;
  const next = (idx>=0 && idx < chapters.length-1) ? chapters[idx+1] : null;

  useEffect(()=>{
    const onScroll = ()=>{
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      const progress = height>0 ? (scrollTop/height)*100 : 0;
      const bar = document.getElementById('reading-progress');
      if(bar) bar.style.width = progress + '%';
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);

  if (!chapter) return <div className="text-center text-sm text-[var(--color-text-dim)] p-8">Loading...</div>;

  return (
    <main className="container-page max-w-4xl mx-auto">
      <nav className="text-xs mb-4 text-[var(--color-text-dim)] flex gap-1"> <a href={`/details/${encodeURIComponent(name)}`} className="hover:text-white">{name}</a> <span>/</span> <span>Chapter {chapter_number}</span></nav>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 md:p-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 tracking-tight">{chapter.title || `Chapter ${chapter_number}`}</h1>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
          {chapter.content}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <a href={`/details/${encodeURIComponent(name)}`} className="px-4 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs hover:border-[var(--color-accent)]">Back to series</a>
          {prev && <a href={`/details/${encodeURIComponent(name)}/chapters/${prev.chapter_number}`} className="px-4 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs hover:border-[var(--color-accent)]">Prev</a>}
          {next && <a href={`/details/${encodeURIComponent(name)}/chapters/${next.chapter_number}`} className="px-4 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs hover:border-[var(--color-accent)]">Next</a>}
        </div>
      </div>
    </main>
  );
}
