"use client";
import React, { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  if (isOnline) return null;
  return (
    <div className="mb-4 p-4 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-700 flex items-center justify-center">
      <span className="font-semibold text-base mr-2">You are offline.</span>
      <span>Please check your internet connection.</span>
    </div>
  );
}
