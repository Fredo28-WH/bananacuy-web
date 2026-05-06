"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Navbar() {
  const [activeHash, setActiveHash] = useState('')
  const [pathname, setPathname] = useState('')
  const [mounted, setMounted] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/logo.png') // Default fallback

  useEffect(() => {
    setMounted(true)
    setPathname(window.location.pathname)
    const handleHashChange = () => setActiveHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    queueMicrotask(() => setActiveHash(window.location.hash))

    // Fetch dynamic logo from Supabase Storage
    const fetchLogo = async () => {
      const { data } = supabase.storage.from("store_assets").getPublicUrl("logo.png");
      if (data && data.publicUrl) {
        // Cek secara fetch HEAD apakah gambar benar-benar ada / tidak error 404
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

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#3e2723] shadow-md border-b border-[#facc15]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#facc15]">
                <img 
                  src={logoUrl} 
                  alt="BananaCuuuyy Logo" 
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <span className="font-extrabold text-2xl text-[#facc15]">BananaCuuuyy</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`font-bold text-lg transition-colors border-b-2 ${
                mounted && pathname === '/' && activeHash === '' ? 'text-white border-white' : 'text-[#facc15] border-transparent hover:text-white hover:border-white/50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/#menu" 
              className={`font-bold text-lg transition-colors border-b-2 ${
                mounted && activeHash === '#menu' ? 'text-white border-white' : 'text-[#facc15] border-transparent hover:text-white hover:border-white/50'
              }`}
            >
              Menu
            </Link>
            <Link 
              href="#kontak" 
              className={`font-bold text-lg transition-colors border-b-2 ${
                mounted && activeHash === '#kontak' ? 'text-white border-white' : 'text-[#facc15] border-transparent hover:text-white hover:border-white/50'
              }`}
            >
              Kontak
            </Link>
            <Link 
              href="/admin" 
              className={`font-bold text-lg transition-colors border-b-2 ${
                mounted && pathname === '/admin' ? 'text-white border-white' : 'text-[#facc15] border-transparent hover:text-white hover:border-white/50'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
