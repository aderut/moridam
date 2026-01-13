export type GeoResult = {
    label: string;
    lat: number;
    lng: number;
};

const PH_CENTER = { lat: 4.84044, lng: 6.96449 }; // your pickup / PH center

export async function geocodePortHarcourt(query: string): Promise<GeoResult[]> {
    const q = query.trim();
    if (!q) return [];

    // A viewbox around Port Harcourt to bias results
    // (lng_left, lat_top, lng_right, lat_bottom)
    const viewbox = [
        PH_CENTER.lng - 0.35,
        PH_CENTER.lat + 0.35,
        PH_CENTER.lng + 0.35,
        PH_CENTER.lat - 0.35,
    ].join(",");

    const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
            q: `${q}, Port Harcourt, Rivers, Nigeria`,
            format: "json",
            addressdetails: "1",
            limit: "5",
            viewbox,
            bounded: "1",
        }).toString();

    const res = await fetch(url, {
        headers: {
            // Nominatim prefers a user agent
            "Accept-Language": "en",
        },
        cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as any[];

    return data.map((r) => ({
        label: r.display_name,
        lat: Number(r.lat),
        lng: Number(r.lon),
    }));
}
