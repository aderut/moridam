import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query || query.length < 3) {
            return NextResponse.json([]);
        }

        // Restrict to Port Harcourt area
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ", Port Harcourt, Nigeria"
        )}&limit=5`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "MoridamCatering/1.0",
            },
        });

        const data = await res.json();

        // Return safe, clean results
        const results = data.map((p: any) => ({
            label: p.display_name,
            lat: Number(p.lat),
            lng: Number(p.lon),
        }));

        return NextResponse.json(results);
    } catch {
        return NextResponse.json([]);
    }
}
