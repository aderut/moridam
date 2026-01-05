"use client";

import { useState } from "react";

export default function ReservationForm() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [guests, setGuests] = useState(2);
    const [ok, setOk] = useState<string | null>(null);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { name, date, time, guests, createdAt: Date.now() };
        localStorage.setItem("reservation", JSON.stringify(payload));
        setOk("Reservation saved ✅");
    }

    return (
        <form onSubmit={onSubmit} className="mt-6 max-w-xl bg-white border rounded-xl p-5 space-y-3">
            <input
                className="w-full h-11 px-4 rounded-lg border"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                className="w-full h-11 px-4 rounded-lg border"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            <input
                className="w-full h-11 px-4 rounded-lg border"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
            />
            <input
                className="w-full h-11 px-4 rounded-lg border"
                type="number"
                min={1}
                max={12}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                required
            />

            <button className="w-full h-11 rounded-lg bg-teal-700 text-white font-semibold">
                Save Reservation
            </button>

            {ok && <p className="text-sm text-teal-700 font-semibold">{ok}</p>}
        </form>
    );
}
