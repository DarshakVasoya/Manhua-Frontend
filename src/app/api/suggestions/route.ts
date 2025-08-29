import { NextRequest } from "next/server";

// Minimal placeholder for /api/suggestions to satisfy the module requirement.
// This proxy can be extended or removed if you always hit the external API directly.
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const prefix = (searchParams.get("prefix") || "").trim();
		const limit = Math.min(Math.max(Number(searchParams.get("limit") || 8), 1), 10);
		const fields = (searchParams.get("fields") || "name,slug").split(",").map(s => s.trim());

		if (prefix.length < 2) {
			return new Response(null, { status: 204 });
		}

		// Upstream endpoint (adjust if backend changes)
		const upstream = `https://api.manhwagalaxy.org/manhwa/suggest?prefix=${encodeURIComponent(prefix)}&limit=${limit}&fields=${encodeURIComponent(fields.join(","))}`;
		const res = await fetch(upstream, { headers: { Accept: "application/json" }, cache: "no-store" });
		if (res.status === 204) return new Response(null, { status: 204 });
		if (!res.ok) return Response.json({ items: [], ttl: 60 }, { status: 200 });
		const data = await res.json();
		return Response.json(data, {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=60, stale-while-revalidate=30",
			},
		});
	} catch {
		// Resilient default: empty list with a short TTL
		return Response.json({ items: [], ttl: 60 }, { status: 200 });
	}
}

export const dynamic = "force-static";
export const revalidate = 60;
