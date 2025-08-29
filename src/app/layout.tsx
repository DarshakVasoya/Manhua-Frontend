import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from './Header';
import OfflineBanner from "@/components/OfflineBanner";

export const metadata: Metadata = {
  title: "Read Manga & Manhwa Online (Ad-Free) - ManhwaGalaxy",
  description:"Read your favorite manga and manhwa at ManhwaGalaxy (also known as Manwha Galaxy or Manga Galaxy). Ad-free, fast, and updated with the latest chapters."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
  {/* Canonical URL for SEO */}
  <link rel="canonical" href="https://manhwagalaxy.org" />
        {/* Inline theme init to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const ls = localStorage.getItem('theme');
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const system = mql.matches ? 'light' : 'dark';
    const theme = (ls === 'light' || ls === 'dark') ? ls : system;
    document.documentElement.dataset.theme = theme;
  } catch(e) {}
})();`
          }}
        />
  {/* iOS: avoid auto telephone/email detection altering layout */}
  <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
  {/* Theme colors for older browsers that don't honor the Next.js viewport.themeColor array */}
  <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#f5f7fa" media="(prefers-color-scheme: light)" />
  {/* Performance: preconnect / dns-prefetch to API origin */}
  <link rel="preconnect" href="https://api.manhwagalaxy.org" />
  <link rel="dns-prefetch" href="//api.manhwagalaxy.org" />
  <link rel="icon" href="/icon/logo_32x32.png"sizes="32x32" type="image/png" />
  <link rel="icon" href="/icon/logo_16x16.png" sizes="16x16" type="image/png" />
  <link rel="icon" href="/icon/logo_32x32.png" sizes="32x32" type="image/png" />
  <link rel="icon" href="/icon/logo_64x64.png" sizes="64x64" type="image/png" />
  <link rel="icon" href="/icon/logo_128x128.png" sizes="128x128" type="image/png" />
  <link rel="icon" href="/icon/logo_256x256.png" sizes="256x256" type="image/png" />
  <link rel="icon" href="/icon/logo_512x512.png" sizes="512x512" type="image/png" />
  <link rel="apple-touch-icon" href="/icon/logo_128x128.png" sizes="128x128" />
  <style>{`#scrollTopBtn{position:fixed;right:1.25rem;bottom:1.25rem;z-index:70;opacity:0;pointer-events:none;transform:translateY(10px);transition:opacity .3s,transform .3s;}#scrollTopBtn.visible{opacity:1;pointer-events:auto;transform:translateY(0);}#scrollTopBtn button{background:var(--color-accent);color:#fff;width:44px;height:44px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 18px -4px rgba(0,0,0,.4);border:1px solid var(--color-border);cursor:pointer;}#scrollTopBtn button:hover{background:var(--color-accent-hover);}#scrollTopBtn svg{pointer-events:none;}@media (max-width:640px){#scrollTopBtn{right:.85rem;bottom:.85rem;width:40px;height:40px;}#scrollTopBtn button{width:40px;height:40px;font-size:18px;}}`}</style>
        <script dangerouslySetInnerHTML={{
          __html:`(()=>{let ticking=false;const btn=()=>document.getElementById('scrollTopBtn');function onScroll(){if(!ticking){requestAnimationFrame(()=>{const sY=window.scrollY;const el=btn();if(!el) return; if(sY>300){el.classList.add('visible')}else{el.classList.remove('visible')} ticking=false;});ticking=true;}};window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('DOMContentLoaded',onScroll);window.addEventListener('pageshow',onScroll);document.addEventListener('click',e=>{const el=btn(); if(el && el.contains(e.target)){window.scrollTo({top:0,behavior:'smooth'});}});})();`
        }} />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YXWMQFBJ8G"></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-YXWMQFBJ8G');`
        }} />
      </head>
      <body className="min-h-screen flex flex-col selection:bg-blue-600/30 theme-fade">
  <OfflineBanner />
        <div id="reading-progress" />
        <Header />
  <div className="flex-1 w-full pt-1 pb-4 md:pt-1 md:pb-5">{children}</div>
        <footer className="mt-auto py-8 text-center text-xs text-[var(--color-text-dim)] border-t border-[var(--color-border)]">
          <div className="container-page flex flex-col gap-2">
            <p>&copy; {new Date().getFullYear()} ManhwaGalaxy. Unofficial fan site.</p>
            <p className="opacity-70">Data provided for preview & educational purposes only.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/terms" className="underline hover:text-white">Terms of Service</a>
              <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>
              <a href="/dmca" className="underline hover:text-white">DMCA Policy</a>
            </div>
          </div>
        </footer>
        <div id="scrollTopBtn" aria-hidden="true">
          <button type="button" aria-label="Scroll to top">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </body>
    </html>
  );
}
