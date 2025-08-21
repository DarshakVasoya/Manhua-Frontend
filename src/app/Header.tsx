"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';

export interface Category { label: string; slug?: string; }
export const headerCategories: Category[] = [];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 'dark');
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const catRef = React.useRef<HTMLDivElement | null>(null); // leftover ref (not used now)
  const lastScrollRef = React.useRef(0);
  const tickingRef = React.useRef(false);
  const scrollDirRef = React.useRef<'up'|'down'|null>(null);

  // Hydrate theme from DOM / localStorage
  useEffect(() => {
    const current = (document.documentElement.dataset.theme as 'light'|'dark') || 'dark';
    setTheme(current);
  setMounted(true);
  }, []);

  // Hide on scroll down, show on scroll up (gentle threshold to prevent flicker)
  useEffect(() => {
    const onScroll = () => {
      if(tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const last = lastScrollRef.current;
        const delta = y - last;
        lastScrollRef.current = y;
        const threshold = 14; // minimal movement to trigger
        // Determine direction only if movement surpasses threshold
        if(Math.abs(delta) > threshold){
          scrollDirRef.current = delta > 0 ? 'down' : 'up';
        }
        if(!open){
          if(scrollDirRef.current === 'down' && y > 120){
            // hide only if scrolled further than 120 to avoid early disappearance on small pages
            setHidden(true);
          } else if(scrollDirRef.current === 'up' || y < 120){
            setHidden(false);
          }
        } else {
          setHidden(false);
        }
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  // Reset scroll tracking & show header when route (pathname) changes
  useEffect(()=>{
    lastScrollRef.current = window.scrollY || 0;
    scrollDirRef.current = null;
    setHidden(false);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      document.body.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch(e) {}
      return next;
    });
  };

  return (
  <div className={`sticky top-0 z-40 backdrop-blur border-b border-[var(--color-border)] transition-transform duration-300 ease-out will-change-transform ${mounted ? (hidden ? '-translate-y-full opacity-0' : 'translate-y-0') : 'translate-y-0'} `} style={{background: 'var(--color-header-backdrop)'}}>
  <div className="container-page flex items-center gap-4 pt-3 pb-2">
        <a href="/" className="flex items-center gap-2 group" aria-label="Go to homepage">
          {/* Two logos; show/hide via data-theme attribute */}
          <img
            src="/manhwagalaxy-logo-2.svg"
            alt="ManhwaGalaxy" width={120} height={48}
            className="transition group-hover:brightness-110 hidden dark-inline"
            data-logo="dark"
          />
          <img
            src="/manhwagalaxy-logo-2-light.svg"
            alt="ManhwaGalaxy" width={120} height={48}
            className="transition group-hover:brightness-110"
            data-logo="light"
          />
        </a>
        <nav className="hidden md:flex gap-6">
          <a href="/" className="text-sm font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]">Home</a>
          <a href="/bookmark" className="text-sm font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]">Bookmark</a>
        </nav>
        {/* Global search */}
        <form
          onSubmit={e=>{e.preventDefault(); const q=(e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim(); if(q) window.location.href=`/search?query=${encodeURIComponent(q)}`; }}
          className="hidden sm:flex items-center ml-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden focus-within:border-[var(--color-accent)] transition w-[200px] md:w-[240px] lg:w-[260px]"
          role="search"
          aria-label="Global search"
        >
          <input name="q" type="text" placeholder="Search..." className="bg-transparent px-3 py-2 text-sm flex-1 outline-none" />
          <button type="submit" className="px-3 py-2 text-xs font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]">Go</button>
        </form>
  <div className="ml-auto flex items-center gap-2">
      <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className={`group relative rounded-full w-11 h-11 flex items-center justify-center border border-[var(--color-border)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] overflow-hidden
        before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_30%_30%,var(--color-accent)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 cursor-pointer
              hover:before:opacity-20 active:scale-95 shadow-sm ${theme==='dark' ? 'text-yellow-300 hover:text-yellow-200' : 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]'}`}
          >
            {theme === 'dark' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-90">
                <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-12">
                <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.12" />
              </svg>
            )}
            <span className="sr-only">{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
          <button aria-label="Toggle menu" onClick={() => setOpen(o=>!o)} className="md:hidden rounded-md px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-white">{open ? 'Close' : 'Menu'}</button>
        </div>
      </div>
  {/* No categories in header now */}
    </div>
  );
}
