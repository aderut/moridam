import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { CartProvider } from "@/app/cart/CartProvider";


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="flex min-h-screen flex-col">
        <CartProvider>

            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </CartProvider>
        </body>
        </html>
    );
}
