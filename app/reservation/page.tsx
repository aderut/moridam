import Navbar from "@/app/components/Navbar";
import ReservationForm from "@/app/components/ReservationForm";
import Footer from "@/app/components/Footer";

export default function ReservationPage() {
    return (
        <>
            <Navbar />
            <main className="max-w-[1120px] mx-auto px-5 py-10">
                <h1 className="text-3xl font-extrabold">Reservation</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Book a table — we’ll save your reservation on this device.
                </p>
                <ReservationForm />
            </main>
            <Footer />
        </>
    );
}
