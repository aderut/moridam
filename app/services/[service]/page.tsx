import ServiceBookingForm from "@/app/components/ServiceBookingForm";

const labels: Record<string, string> = {
    caterings: "Catering Booking",
    birthdays: "Birthday Booking",
    weddings: "Wedding Booking",
    events: "Event Booking",
};

export default function ServiceBookingPage({
                                               params,
                                           }: {
    params: { service: string };
}) {
    const name = labels[params.service] ?? "Service Booking";

    return (
        <div className="bg-[var(--bg)] min-h-screen py-10">
            <div className="max-w-[820px] mx-auto px-5">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)]">
                    {name}
                </h1>
                <p className="mt-2 text-[var(--color-muted)]">
                    Tell us how many guests and your details. We’ll reach out to confirm.
                </p>

                <div className="mt-8 bg-white border border-[var(--line)] rounded-2xl p-6">
                    <ServiceBookingForm service={params.service} />
                </div>
            </div>
        </div>
    );
}
