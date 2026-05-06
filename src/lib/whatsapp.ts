import { CartItem } from '@/store/cartStore'

// The target WhatsApp number
const WA_NUMBER = "6281237766977" 

export function formatOrderForWhatsApp(
  items: CartItem[], 
  total: number, 
  buyerName: string, 
  buyerAddress: string, 
  buyerLocation: string | null,
  paymentProofUrl: string | null
): string {
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  let text = `Halo Admin Bananacuy, saya ingin memesan:\n\n`
  text += `*Data Pemesan:*\n`
  text += `Nama: ${buyerName}\n`
  text += `Alamat Detail: ${buyerAddress}\n`
  if (buyerLocation) {
    text += `Peta/Titik Lokasi: ${buyerLocation}\n`
  }
  text += `\n*Pesanan:*\n`
  
  items.forEach((item, index) => {
    const addonsTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0)
    const itemTotal = item.price + addonsTotal
    
    text += `${index + 1}. *${item.name}*\n`
    if (item.selectedAddons.length > 0) {
      text += `   [Topping: ${item.selectedAddons.map(a => a.name).join(', ')}]\n`
    }
    text += `   ${item.quantity} x ${formatIDR(itemTotal)} = ${formatIDR(itemTotal * item.quantity)}\n\n`
  })

  text += `\n*TOTAL: ${formatIDR(total)}*\n\n`
  text += `Saya sudah melakukan pembayaran.\n`
  
  if (paymentProofUrl) {
    text += `Bukti transfer (Link Gambar): ${paymentProofUrl}\n\n`
  } else {
    text += `(Belum melampirkan bukti transfer)\n\n`
  }
  text += `Terima kasih!`

  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${WA_NUMBER}?text=${encodedText}`
}
