import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { CartProvider } from "@/app/components/cart/CartProvider";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="flex min-h-screen flex-col">
        <CartProvider>
            {/* Top navigation */}
            <Navbar />

            {/* Page content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer (ONLY here) */}
            <Footer />
        </CartProvider>
        </body>
        </html>
    );
}
