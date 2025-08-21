/* Enhanced service worker for chapter images + API JSON (stale-while-revalidate) */
const IMG_CACHE = 'chapter-images-v2';
const API_CACHE = 'api-json-v1';
const STATIC_CACHE = 'static-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', evt => {
	evt.waitUntil(
		caches.open(STATIC_CACHE).then(c => c.addAll([OFFLINE_URL]).catch(()=>{}))
	);
	self.skipWaiting();
});

self.addEventListener('activate', evt => {
	evt.waitUntil(
		caches.keys().then(keys => Promise.all(
			keys.filter(k => ![IMG_CACHE, API_CACHE, STATIC_CACHE].includes(k)).map(k => caches.delete(k))
		))
	);
	self.clients.claim();
});

function isAPIRequest(url){
	return /\/manhwa\//i.test(url.pathname) && (url.pathname.includes('/chapter') || url.pathname.includes('/chapters'));
}

self.addEventListener('fetch', evt => {
	const req = evt.request;
	const url = new URL(req.url);
	if(req.method !== 'GET') return;

	// Images (cache-first with update in background)
	if(req.destination === 'image' && /\/manga\//i.test(req.url)){
		evt.respondWith((async()=>{
			const cache = await caches.open(IMG_CACHE);
			const hit = await cache.match(req);
			const fetchAndPut = fetch(req).then(res=>{ if(res.ok) cache.put(req, res.clone()); return res; }).catch(()=>hit);
			return hit || fetchAndPut;
		})());
		return;
	}

	// API JSON (stale-while-revalidate)
	if(isAPIRequest(url)){
		evt.respondWith((async()=>{
			const cache = await caches.open(API_CACHE);
			const hit = await cache.match(req);
			const net = fetch(req).then(res=>{ if(res.ok) cache.put(req, res.clone()); return res; }).catch(()=>hit || new Response('[]',{status:200, headers:{'Content-Type':'application/json'}}));
			if(hit){ net; return hit; }
			return net;
		})());
		return;
	}

	// Document fallback offline
	if(req.mode === 'navigate'){
		evt.respondWith((async()=>{
			try { return await fetch(req); } catch(e){ const cache = await caches.open(STATIC_CACHE); const off = await cache.match(OFFLINE_URL); return off || new Response('<h1>Offline</h1>',{headers:{'Content-Type':'text/html'}}); }
		})());
	}
});

self.addEventListener('message', evt => {
	if(evt.data === 'SKIP_WAITING') self.skipWaiting();
});
