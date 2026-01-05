

export default function ContactPage() {
    return (
        <>

            <main className="max-w-[1120px] mx-auto px-5 py-10">
                <h1 className="text-3xl font-extrabold">Contact</h1>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-xl p-5">
                        <div className="font-bold">Our Location</div>
                        <p className="mt-2 text-sm text-slate-500">
                            12 Garden Avenue, Lagos (example)
                        </p>

                        <div className="mt-4 font-bold">Hours</div>
                        <p className="mt-2 text-sm text-slate-500">
                            Mon–Sun: 7:00am – 10:00pm
                        </p>

                        <div className="mt-4 font-bold">Phone</div>
                        <p className="mt-2 text-sm text-slate-500">+234 800 000 0000</p>
                    </div>

                    <form className="bg-white border rounded-xl p-5 space-y-3">
                        <input
                            className="w-full h-11 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-700"
                            placeholder="Your name"
                        />
                        <input
                            className="w-full h-11 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-700"
                            placeholder="Email"
                            type="email"
                        />
                        <textarea
                            className="w-full min-h-[120px] px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-700"
                            placeholder="Message"
                        />
                        <button className="w-full h-11 rounded-lg bg-teal-700 text-white font-semibold">
                            Send Message
                        </button>
                    </form>
                </div>
            </main>

        </>
    );
}
