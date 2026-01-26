import ServiceBookingForm from "@/app/components/ServiceBookingForm";

function prettyService(v: string) {
    return v
        .replace(/-/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function ServiceBookingPage({
                                               searchParams,
                                           }: {
    searchParams: { service?: string };
}) {
    const raw = (searchParams?.service ?? "").trim();
    const service = raw ? prettyService(raw) : "";

    return (
        <div className="bg-[var(--bg)] min-h-screen pt-24 pb-12">
            <div className="max-w-[900px] mx-auto px-5">
                <h1 className="text-4xl font-extrabold text-[var(--ink)]">Book a Service</h1>
                <p className="mt-2 text-[var(--color-muted)]">
                    {service ? (
                        <>
                            You’re booking: <b>{service}</b>
                        </>
                    ) : (
                        <>
                            No service selected. Please go back and select a service.
                        </>
                    )}
                </p>

                <div className="mt-8 bg-white border border-[var(--line)] rounded-2xl p-6">
                    <ServiceBookingForm service={service} />
                </div>
            </div>
        </div>
    );
}
