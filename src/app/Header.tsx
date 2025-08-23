"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import SearchBar from "../components/SearchBar";


export interface Category { label: string; slug?: string; }
export const headerCategories: Category[] = [];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
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
      <div className="container-page flex items-center pt-3 pb-2 min-w-0">
        {/* Logo and nav on left */}
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Go to homepage">
            {/* Two logos; show/hide via data-theme attribute */}
            <Image
              src="/manhwagalaxy-logo-2.svg"
              alt="ManhwaGalaxy"
              width={120}
              height={48}
              className="transition group-hover:brightness-110 hidden dark-inline"
              data-logo="dark"
            />
            <Image
              src="/manhwagalaxy-logo-2-light.svg"
              alt="ManhwaGalaxy"
              width={120}
              height={48}
              className="transition group-hover:brightness-110"
              data-logo="light"
            />
          </Link>
          <nav className={`gap-6 ${open ? 'flex flex-col absolute top-full left-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] z-50 p-4' : 'hidden md:flex'}`}>
            <Link href="/" className="text-sm font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]">Home</Link>
            <Link href="/bookmark" className="text-sm font-semibold text-[var(--color-text-dim)] hover:text-[var(--color-text)]">Bookmark</Link>
          </nav>
        </div>
        {/* Right controls for mobile and desktop */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop search bar */}
          <div className="hidden sm:flex">
            <SearchBar className="w-full max-w-xs sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px]" />
          </div>
          {/* Search icon for mobile */}
          <button
            type="button"
            className="flex sm:hidden items-center justify-center rounded-full w-10 h-10 border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            aria-label="Open search"
            onClick={() => setSearchModal(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          {/* Theme button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className={`group relative rounded-full w-10 h-10 flex items-center justify-center border border-[var(--color-border)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] overflow-hidden
              before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_30%_30%,var(--color-accent)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 cursor-pointer
              hover:before:opacity-20 active:scale-95 shadow-sm ${theme==='dark' ? 'text-yellow-300 hover:text-yellow-200' : 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]'}`}
          >
            {theme === 'dark' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-90">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-12">
                <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.12" />
              </svg>
            )}
            <span className="sr-only">{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
          {/* Menu icon for mobile */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(o => !o)}
            className="md:hidden rounded-full w-10 h-10 flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-white"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile search modal */}
      {searchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setSearchModal(false)}>
          <div className="bg-[var(--color-surface)] rounded-lg shadow-lg p-4 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">Search</span>
              <button onClick={() => setSearchModal(false)} aria-label="Close search" className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] p-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
              </button>
            </div>
            <SearchBar className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
