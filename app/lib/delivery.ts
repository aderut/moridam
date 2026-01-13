const ORS_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

export async function calculateDelivery(
    from: [number, number], // [lng, lat]
    to: [number, number]
) {
    if (!ORS_KEY) {
        throw new Error("Missing OpenRouteService API key");
    }

    const res = await fetch(
        "https://api.openrouteservice.org/v2/matrix/driving-car",
        {
            method: "POST",
            headers: {
                Authorization: ORS_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                locations: [from, to],
                metrics: ["distance"],
                units: "km",
            }),
        }
    );

    if (!res.ok) {
        throw new Error("Failed to calculate delivery distance");
    }

    const data = await res.json();
    const distanceKm = data.distances[0][1];

    // Pricing logic (you can tweak later)
    const BASE_FEE = 500; // ₦
    const PER_KM = 150; // ₦

    return Math.round(BASE_FEE + distanceKm * PER_KM);
}
