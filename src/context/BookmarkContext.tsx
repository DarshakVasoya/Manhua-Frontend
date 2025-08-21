"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface BookmarkItem { id: string; title: string; imageUrl: string; url: string; lastChapter?: string | number; }
interface BookmarkCtx { bookmarks: BookmarkItem[]; toggleBookmark: (item: BookmarkItem) => void; isBookmarked: (id: string) => boolean; }
const BookmarkContext = createContext<BookmarkCtx | undefined>(undefined);
const STORAGE_KEY = 'mgx_bookmarks_v1';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  useEffect(()=>{ try { const raw = localStorage.getItem(STORAGE_KEY); if(raw) setBookmarks(JSON.parse(raw)); } catch {} },[]);
  useEffect(()=>{ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks)); } catch {} },[bookmarks]);
  const toggleBookmark = (item: BookmarkItem) => setBookmarks(prev => prev.some(b=>b.id===item.id) ? prev.filter(b=>b.id!==item.id) : [...prev, item]);
  const isBookmarked = (id: string) => bookmarks.some(b=>b.id===id);
  return <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>{children}</BookmarkContext.Provider>;
};
export function useBookmarks(){ const ctx = useContext(BookmarkContext); if(!ctx) throw new Error('useBookmarks must be used inside BookmarkProvider'); return ctx; }
