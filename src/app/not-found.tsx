"use client";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="container-page max-w-xl mx-auto py-20 flex flex-col items-center justify-center">
      <div className="mb-8">
        {/* Animated SVG: Modern 404 illustration with color and motion */}
        <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce-slow">
          <g>
            <ellipse cx="110" cy="160" rx="70" ry="12" fill="#E0E7FF" opacity="0.6" />
            <text x="50" y="90" fontSize="64" fontWeight="bold" fill="#6366F1" opacity="0.85">404</text>
            <circle cx="80" cy="120" r="18" fill="#FBBF24" />
            <circle cx="140" cy="120" r="18" fill="#FBBF24" />
            <ellipse cx="110" cy="120" rx="32" ry="18" fill="#fff" opacity="0.8" />
            <circle cx="100" cy="115" r="4" fill="#6366F1" />
            <circle cx="120" cy="115" r="4" fill="#6366F1" />
            <path d="M100 130 Q110 140 120 130" stroke="#6366F1" strokeWidth="2" fill="none" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -16; 0 0" dur="2.5s" repeatCount="indefinite" />
          </g>
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-center">404 - Page Not Found</h1>
      <p className="text-lg text-[var(--color-text-dim)] mb-8 text-center">Oops! The page you are looking for does not exist.<br/>Try going back to the homepage or explore other manga!</p>
      <Link href="/" className="px-6 py-3 rounded-md bg-[var(--color-accent)] text-white font-semibold shadow-lg hover:bg-[var(--color-accent-hover)] transition">Go Home</Link>
      <style>{`
        .animate-bounce-slow {
          animation: bounce 2.5s infinite cubic-bezier(.5,0,.5,1);
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </main>
  );
}
