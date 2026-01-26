import { NextResponse } from "next/server";

const ORS_KEY = process.env.ORS_API_KEY;

export async function POST(req: Request) {
    try {
        if (!ORS_KEY) {
            return NextResponse.json(
                { error: "ORS_API_KEY not set" },
                { status: 500 }
            );
        }

        const body = await req.json().catch(() => null);
        const addressRaw = String(body?.address ?? "").trim();

        if (!addressRaw) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            );
        }

        // ✅ Force Port Harcourt for accuracy
        const query = `${addressRaw}, Port Harcourt, Rivers, Nigeria`;

        const url =
            "https://api.openrouteservice.org/geocode/search?" +
            new URLSearchParams({
                text: query,
                size: "1",
                "focus.point.lat": "4.8156",
                "focus.point.lon": "7.0498",
            }).toString();

        const res = await fetch(url, {
            headers: {
                Authorization: ORS_KEY,
            },
            cache: "no-store",
        });

        const data = await res.json();

        const feature = data?.features?.[0];
        const coords = feature?.geometry?.coordinates; // [lng, lat]

        if (!coords || coords.length < 2) {
            return NextResponse.json(
                { error: "Address not found" +
                        "" +
                        "" +
                        "" },
                { status: 404 }
            );
        }

        const [lng, lat] = coords;

        return NextResponse.json({
            lng,
            lat,
            label: feature?.properties?.label ?? query,
        });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Geocoding failed" },
            { status: 500 }
        );
    }
}
