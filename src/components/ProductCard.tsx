"use client"
import { useState } from 'react'
import { useCartStore, Product, Addon } from '@/store/cartStore'
import { useProductStore } from '@/store/productStore'
import { useSettingStore } from '@/store/settingStore'
import { ShoppingCart, X, Plus } from 'lucide-react'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setIsCartOpen } = useCartStore()
  const { toppings } = useProductStore()
  const { isStoreOpen } = useSettingStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([])

  const handleOpenModal = () => {
    setSelectedAddons([])
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.name === addon.name)
      if (exists) {
        return prev.filter(a => a.name !== addon.name)
      }
      return [...prev, addon]
    })
  }

  const handleAddToCart = () => {
    addToCart(product, selectedAddons)
    setIsModalOpen(false)
    setIsCartOpen(true)
  }

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  const totalPrice = product.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)

  return (
    <>
      <div className="group relative bg-[#fef6e5] rounded-3xl overflow-hidden border border-[#4a3525]/10 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative w-full aspect-square bg-[#facc15]/20 overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#4a3525]/40 font-bold tracking-widest text-xl opacity-50 select-none group-hover:scale-110 transition-transform duration-500">
              BANANACUY
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#4a3525] mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-sm text-[#4a3525]/70 line-clamp-2 h-10">{product.description}</p>
          </div>

          <div className="w-full flex items-center justify-between mt-2">
            <span className="text-lg font-extrabold text-[#4a3525]">{formatIDR(product.price)}</span>
            <button 
              onClick={handleOpenModal}
              disabled={product.isActive === false || !isStoreOpen}
              className={`flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-xl transition-all duration-200 shadow-md ${
                product.isActive !== false && isStoreOpen
                  ? "bg-[#facc15] hover:bg-[#eab308] text-[#4a3525] active:scale-95 hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.isActive !== false && isStoreOpen ? (
                <>
                  <ShoppingCart size={18} />
                  <span className="hidden sm:inline">Tambah</span>
                </>
              ) : !isStoreOpen ? (
                <span className="text-sm">Toko Tutup</span>
              ) : (
                <span className="text-sm">Habis</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#4a3525]/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-[#fef6e5] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#4a3525]/10 flex items-center justify-between sticky top-0 bg-[#facc15] z-10 rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-[#4a3525]">{product.name}</h3>
                <p className="text-[#4a3525]/80 text-sm font-medium">{formatIDR(product.price)}</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 bg-white/30 hover:bg-white/50 rounded-full transition-colors text-[#4a3525]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1">
              <h4 className="font-bold text-[#4a3525] mb-4 flex items-center gap-2">
                <Plus size={18} />
                Pilih Topping (Opsional)
              </h4>
              <div className="space-y-3">
                {toppings?.map(addon => {
                  const count = selectedAddons.filter(a => a.name === addon.name).length
                  return (
                    <div key={addon.name} className="flex items-center justify-between p-3 rounded-xl border border-[#4a3525]/10 hover:bg-white transition-colors">
                      <div className="flex flex-col text-[#4a3525]">
                        <span className="font-medium">{addon.name}</span>
                        <span className="text-sm font-bold opacity-70">+{formatIDR(addon.price)}</span>
                      </div>
                      <div className="flex items-center gap-3 border border-[#4a3525]/20 bg-[#fef6e5] rounded-lg px-2 py-1">
                        <button 
                          onClick={() => {
                            setSelectedAddons(prev => {
                              const index = prev.findIndex(a => a.name === addon.name)
                              if (index !== -1) {
                                const newAddons = [...prev]
                                newAddons.splice(index, 1)
                                return newAddons
                              }
                              return prev
                            })
                          }}
                          className={`w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm border border-[#4a3525]/10 font-bold transition-colors ${count === 0 ? 'text-gray-300 pointer-events-none' : 'text-[#4a3525] hover:bg-gray-100 active:bg-gray-200'}`}
                        >
                          -
                        </button>
                        <span className="font-bold text-[#4a3525] w-4 text-center">{count}</span>
                        <button 
                          onClick={() => {
                            setSelectedAddons(prev => [...prev, addon])
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-[#4a3525] text-white shadow-sm border border-[#4a3525]/10 font-bold hover:bg-[#4a3525]/90 transition-colors active:bg-[#4a3525]/80"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 border-t border-[#4a3525]/10 bg-white sticky bottom-0 rounded-b-3xl mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#4a3525] font-semibold">Total:</span>
                <span className="text-2xl font-black text-[#4a3525]">{formatIDR(totalPrice)}</span>
              </div>
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 px-4 bg-[#4a3525] hover:bg-[#4a3525]/90 text-[#facc15] font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200"
              >
                Pilih & Tambah Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
