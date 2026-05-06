"use client";

import Image from "next/image";
import { ArrowRight, Banana } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProductStore, Product } from "@/store/productStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { products, fetchData } = useProductStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");

  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true));
    fetchData();

    // Fetch dynamic logo from Supabase Storage
    const fetchLogo = async () => {
      const { data } = supabase.storage.from("store_assets").getPublicUrl("logo.png");
      if (data && data.publicUrl) {
        try {
          const res = await fetch(data.publicUrl, { method: 'HEAD' });
          if (res.ok) {
            setLogoUrl(`${data.publicUrl}?t=${Date.now()}`);
          }
        } catch(e) {
           console.log("Using default logo");
        }
      }
    };
    fetchLogo();
  }, [fetchData]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-[#facc15] py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#fef6e5]/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-[#4a3525]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56 mb-6 drop-shadow-2xl rounded-full bg-white/20 p-2 flex items-center justify-center">
            <img 
              src={logoUrl} 
              alt="BananaCuuuyy Logo" 
              className="w-full h-full object-contain drop-shadow-md z-10 rounded-full bg-white"
            />
          </div>
          
         
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#4a3525] tracking-tight mb-6 max-w-4xl leading-tight">
            BananaCuuuyy
          </h1>
          <p className="text-lg md:text-xl text-[#4a3525]/80 mb-10 max-w-2xl font-medium">
            Nikmati kelezatan pisang goreng dengan topping pilihan yang melimpah!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#menu" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#4a3525] text-[#facc15] rounded-full font-bold text-lg hover:bg-[#614631] transition-transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
            >
              Lihat Menu <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Menu / Our Products Section */}
      <section id="menu" className="py-20 bg-[#fef6e5] min-h-screen scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center mb-16 relative">
            <div className="bg-[#facc15]/20 p-4 rounded-full mb-6">
              <Banana size={48} className="text-[#4a3525]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#4a3525] mb-4">
              Menu Pilihan Kami
            </h2>
            <p className="text-lg text-[#4a3525]/70 max-w-2xl">
              Pilih varian topping favoritmu! Semua dibuat dadakan, dijamin masih hangat pas sampai di tangan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {isHydrated && products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
