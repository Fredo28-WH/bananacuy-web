"use client"
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function FloatingCart() {
  const { getCartCount, setIsCartOpen } = useCartStore()
  const cartCount = getCartCount()

  // Sembunyikan floating cart jika keranjang kosong (opsional) atau tampilkan selalu
  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-50 p-4 bg-[#facc15] text-[#4a3525] hover:bg-[#eab308] rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center border-4 border-white"
      aria-label="Buka Keranjang"
    >
      <ShoppingCart size={28} className="fill-current" />
      {cartCount > 0 && (
        <span className="absolute -top-3 -right-3 flex items-center justify-center min-w-[28px] h-7 px-2 text-sm font-extrabold text-white bg-red-600 border-2 border-white rounded-full shadow-md animate-bounce">
          {cartCount}
        </span>
      )}
    </button>
  )
}
