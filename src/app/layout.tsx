import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingCart } from "@/components/FloatingCart";

export const metadata: Metadata = {
  title: "BananaCuuuyy - Nuget Pisang Goreng",
  description: "Nuget pisang lumer bikin nagih! Pilihan tepat untuk teman ngemil Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col relative">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <FloatingCart />
        <CartDrawer />
      </body>
    </html>
  );
}
