import { NextResponse } from "next/server";

const ORS_KEY = process.env.ORS_API_KEY; // server-only (no NEXT_PUBLIC)
const PICKUP: [number, number] = [4.84044, 6.96449]; // [lng, lat] Rumuevorlu

export async function POST(req: Request) {
    try {
        if (!ORS_KEY) {
            return NextResponse.json({ error: "ORS_API_KEY not set" }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.to || !Array.isArray(body.to) || body.to.length !== 2) {
            return NextResponse.json({ error: "Missing to coords" }, { status: 400 });
        }

        const to: [number, number] = [Number(body.to[0]), Number(body.to[1])]; // [lng, lat]

        const res = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
            method: "POST",
            headers: {
                Authorization: ORS_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                locations: [PICKUP, to],
                metrics: ["distance"],
                units: "km",
            }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.error?.message || data?.message || "ORS request failed" },
                { status: 500 }
            );
        }

        const distanceKm = Number(data?.distances?.[0]?.[1] ?? 0);

        // pricing
        const BASE_FEE = 500;
        const PER_KM = 150;
        const fee = Math.round(BASE_FEE + distanceKm * PER_KM);

        return NextResponse.json({ fee, distanceKm });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Delivery calc failed" }, { status: 500 });
    }
}
