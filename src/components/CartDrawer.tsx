"use client"
import { X, Plus, Minus, Trash2, MapPin, UploadCloud, ChevronLeft, QrCode } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatOrderForWhatsApp } from '@/lib/whatsapp'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type CheckoutStep = 'cart' | 'form_lokasi' | 'pembayaran' | 'bukti_bayar'

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore()
  
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [buyerName, setBuyerName] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [buyerLocation, setBuyerLocation] = useState<string>('')
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // reset state when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => {
        setStep('cart')
        setPaymentProof(null)
        setPaymentProofFile(null)
        setIsSubmitting(false)
      }, 300) // reset after animation
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBuyerLocation(`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`)
        },
        (error) => {
          alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.")
        }
      )
    } else {
      alert("Browser Anda tidak mendukung Geolocation.")
    }
  }

  const handleFinalCheckout = async () => {
    setIsSubmitting(true)
    let paymentProofUrl: string | null = null

    if (!paymentProofFile) {
      alert("Mohon sertakan bukti transfer pembayaran (foto/screenshot) terlebih dahulu!")
      setIsSubmitting(false)
      return
    }

    if (paymentProofFile) {
      const fileExt = paymentProofFile.name.split('.').pop()
      const fileName = `bukti_bayar_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, paymentProofFile)

      if (error) {
        console.error("Gagal upload gambar:", error)
        alert("Gagal mengunggah foto bukti pembayaran. Pastikan pengaturan Supabase Storage 'payment_proofs' telah tersedia dan mengizinkan insert.")
        setIsSubmitting(false)
        return
      }

      const { data } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(fileName)
        
      paymentProofUrl = data.publicUrl
    }

    const total = getCartTotal()
    const url = formatOrderForWhatsApp(items, total, buyerName, buyerAddress, buyerLocation, paymentProofUrl)
    window.open(url, '_blank')
    clearCart()
    setIsCartOpen(false)
    setIsSubmitting(false)
  }

  // Format currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#4a3525]/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#fef6e5] shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-[#4a3525]/10 bg-[#facc15]">
          <div className="flex items-center gap-2">
            {step !== 'cart' && (
              <button onClick={() => {
                if(step === 'form_lokasi') setStep('cart')
                if(step === 'pembayaran') setStep('form_lokasi')
                if(step === 'bukti_bayar') setStep('pembayaran')
              }} className="p-1 hover:bg-[#4a3525]/10 rounded-full">
                <ChevronLeft size={20} className="text-[#4a3525]" />
              </button>
            )}
            <h2 className="text-xl font-bold text-[#4a3525]">
              {step === 'cart' ? 'Keranjang' : 
               step === 'form_lokasi' ? 'Data Pengiriman' : 
               step === 'pembayaran' ? 'Pembayaran' : 'Bukti Bayar'}
            </h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-[#4a3525] hover:bg-[#4a3525]/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {step === 'cart' && (
          items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#4a3525]/60">
              <p>Keranjang masih kosong.</p>
            </div>
          ) : (
            items.map((item) => {
              const addonsTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0)
              const itemTotal = item.price + addonsTotal

              return (
              <div key={item.cartItemId} className="flex gap-4 border-b border-[#4a3525]/10 pb-4">
                <div className="w-20 h-20 bg-[#4a3525]/10 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#facc15]/30"></div> // placeholder
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[#4a3525] line-clamp-1">{item.name}</h3>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-[11px] text-[#4a3525]/60 leading-tight mt-1">
                        + {item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-[#4a3525]/70 font-medium mt-1">
                      {formatIDR(itemTotal)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-[#4a3525]/20 rounded-full bg-white px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="text-[#4a3525] hover:bg-[#4a3525]/10 rounded-full p-1 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-[#4a3525] text-sm w-6 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="text-[#4a3525] hover:bg-[#4a3525]/10 rounded-full p-1 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              )
            })
          )
        )}

          {step === 'form_lokasi' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-[#4a3525] mb-1">Nama Pemesan <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full p-3 border-2 border-[#4a3525]/20 rounded-xl focus:border-[#facc15] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#4a3525] mb-1">Detail Alamat <span className="text-red-500">*</span></label>
                <textarea 
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Contoh: Jl. Mangga No 12, RT 01 RW 02, pagar hitam."
                  className="w-full p-3 border-2 border-[#4a3525]/20 rounded-xl focus:border-[#facc15] focus:outline-none min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#4a3525] mb-1">Titik Lokasi Pengiriman <span className="text-red-500">*</span></label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={buyerLocation}
                    onChange={(e) => setBuyerLocation(e.target.value)}
                    placeholder="Link Google Maps atau ketik patokan lokasi"
                    className="w-full p-3 border-2 border-[#4a3525]/20 rounded-xl focus:border-[#facc15] focus:outline-none"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <hr className="flex-1 border-[#4a3525]/20" />
                    <span className="text-xs text-gray-400 font-bold">ATAU</span>
                    <hr className="flex-1 border-[#4a3525]/20" />
                  </div>
                  <button 
                    onClick={handleGetLocation}
                    type="button"
                    className="w-full p-3 flex items-center justify-center gap-2 rounded-xl font-bold transition-colors bg-[#4a3525]/10 text-[#4a3525] hover:bg-[#4a3525]/20"
                  >
                    <MapPin size={20} />
                    Ambil Lokasi GPS Saat Ini
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Anda bisa menempelkan (paste) link Google Maps sendiri, atau menekan tombol GPS (pastikan izin lokasi browser aktif).
                </p>
              </div>
            </div>
          )}

          {step === 'pembayaran' && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4a3525]/10">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pembayaran</span>
                <span className="block text-2xl font-extrabold text-[#4a3525]">{formatIDR(getCartTotal())}</span>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4a3525]/10 text-center">
                <h3 className="font-bold text-[#4a3525] mb-4 flex items-center justify-center gap-2">
                  <QrCode size={20} /> Scan QRIS
                </h3>
                <div className="bg-gray-50 w-48 h-48 mx-auto rounded-xl flex items-center justify-center border-4 border-dashed border-gray-200 mb-4 relative overflow-hidden">
                   <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/store_assets/qris_active.png?t=${Date.now()}`} alt="QRIS Toko" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   <span className="absolute -z-10 font-bold text-gray-400 text-sm">Belum Ada QRIS</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">BCA, Mandiri, GoPay, OVO, Dana, ShopeePay</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4a3525]/10">
                <h3 className="font-bold text-[#4a3525] mb-2 border-b pb-2">Transfer Bank Manual</h3>
                <p className="text-sm font-bold mt-2">Sea Bank: <span className="font-mono text-lg text-blue-600">9011 2496 0690</span></p>
                <p className="text-xs text-gray-500">A.n. Fredovian WilaHuky</p>
              </div>
            </div>
          )}

          {step === 'bukti_bayar' && (
             <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4a3525]/10 text-center">
                 <h3 className="font-bold text-[#4a3525] mb-2">Upload Bukti Transfer / Screenshot <span className="text-red-500">*</span></h3>
                 <p className="text-sm text-gray-600 mb-4">Silahkan siapkan foto atau screenshot bukti pembayaran Anda. Foto ini nantinya akan dilampirkan saat Anda meneruskan pesanan ini ke WhatsApp Admin.</p>
                 
                 <label className="cursor-pointer border-2 border-dashed border-[#4a3525]/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-2">
                   {paymentProof ? (
                      <div className="relative w-full">
                        <img src={paymentProof} alt="Bukti" className="w-full h-32 object-contain rounded" />
                        <span className="mt-2 block text-xs font-bold text-green-600">Foto Siap Diunggah!</span>
                      </div>
                   ) : (
                      <>
                        <UploadCloud size={32} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-600">Pilih Foto</span>
                      </>
                   )}
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                     const file = e.target.files?.[0]
                     if(file) {
                       setPaymentProofFile(file)
                       const reader = new FileReader()
                       reader.onload = () => setPaymentProof(reader.result as string)
                       reader.readAsDataURL(file)
                     }
                   }} />
                 </label>
               </div>
             </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-[#4a3525]/10 bg-white">
            {step === 'cart' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-[#4a3525]">Total</span>
                  <span className="font-bold text-xl text-[#4a3525]">{formatIDR(getCartTotal())}</span>
                </div>
                <button 
                  onClick={() => setStep('form_lokasi')}
                  className="w-full py-3 px-4 bg-[#4a3525]/90 hover:bg-[#4a3525] text-[#facc15] font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200 flex items-center justify-center gap-2"
                >
                  Lanjut Pengiriman
                </button>
              </>
            )}

            {step === 'form_lokasi' && (
              <button 
                onClick={() => {
                  if(!buyerName || !buyerAddress || !buyerLocation) {
                    alert("Mohon lengkapi Nama, Detail Alamat, dan Titik Lokasi Pengiriman terlebih dahulu!")
                    return
                  }
                  setStep('pembayaran')
                }}
                className="w-full py-3 px-4 bg-[#4a3525]/90 hover:bg-[#4a3525] text-[#facc15] font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200"
              >
                Lanjut ke Pembayaran
              </button>
            )}

            {step === 'pembayaran' && (
               <button 
                  onClick={() => setStep('bukti_bayar')}
                  className="w-full py-3 px-4 bg-[#4a3525]/90 hover:bg-[#4a3525] text-[#facc15] font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200"
                >
                 Saya Sudah Bayar
               </button>
            )}

            {step === 'bukti_bayar' && (
               <button 
                  onClick={handleFinalCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                 {isSubmitting ? 'Mengunggah & Memproses...' : 'Kirim Pesanan ke WhatsApp Admin'}
               </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}