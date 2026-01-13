import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid caching in dev/prod

const ORS_KEY = process.env.ORS_API_KEY; // SERVER env (not NEXT_PUBLIC)

// Rumuevorlu pickup [lng, lat]
const PICKUP: [number, number] = [6.96449, 4.84044];

function toNumberPair(v: any): [number, number] | null {
    if (!Array.isArray(v) || v.length !== 2) return null;

    const lng = Number(v[0]);
    const lat = Number(v[1]);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

    // basic range checks
    if (lng < -180 || lng > 180) return null;
    if (lat < -90 || lat > 90) return null;

    return [lng, lat];
}

export async function POST(req: Request) {
    try {
        if (!ORS_KEY) {
            return NextResponse.json({ error: "ORS_API_KEY not set" }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        const to = toNumberPair(body?.to);

        if (!to) {
            return NextResponse.json(
                { error: "Missing/invalid 'to' coordinates. Expected [lng, lat]." },
                { status: 400 }
            );
        }

        // If user enters same place as pickup, distance will be 0
        const res = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
            method: "POST",
            headers: {
                Authorization: ORS_KEY,
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
                locations: [PICKUP, to], // [from, to]
                metrics: ["distance"],
                units: "km",
            }),
        });

        const data = await res.json().catch(() => null);

        // ✅ handle ORS errors properly
        if (!res.ok) {
            return NextResponse.json(
                { error: data?.error?.message || data?.message || "ORS request failed", raw: data },
                { status: 500 }
            );
        }

        const distanceKm = data?.distances?.[0]?.[1];

        if (!Number.isFinite(distanceKm)) {
            return NextResponse.json(
                { error: "Could not calculate distance", raw: data, usedPickup: PICKUP, usedTo: to },
                { status: 400 }
            );
        }

        // Pricing logic
        const BASE_FEE = 500; // ₦
        const PER_KM = 150;   // ₦

        const fee = Math.round(BASE_FEE + Number(distanceKm) * PER_KM);

        return NextResponse.json({
            distanceKm: Number(distanceKm),
            fee,
            usedPickup: PICKUP,
            usedTo: to, // ✅ so you can confirm it changes
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Quote failed" }, { status: 500 });
    }
}
