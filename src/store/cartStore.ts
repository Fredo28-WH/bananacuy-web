import { create } from 'zustand'

export interface Addon {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  isActive?: boolean
}

export interface CartItem extends Product {
  cartItemId: string
  quantity: number
  selectedAddons: Addon[]
}

interface CartStore {
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  items: CartItem[]
  addToCart: (product: Product, addons: Addon[]) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addToCart: (product, addons) => {
    set((state) => {
      // Create a unique cart item ID based on product and sorted addons
      const addonsKey = addons.map(a => a.name).sort().join('-')
      const cartItemId = `${product.id}-${addonsKey}`
      
      const existing = state.items.find((item) => item.cartItemId === cartItemId)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { items: [...state.items, { ...product, cartItemId, quantity: 1, selectedAddons: addons }] }
    })
  },
  removeFromCart: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }))
  },
  updateQuantity: (cartItemId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0),
    }))
  },
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    return get().items.reduce((total, item) => {
      const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
      return total + (item.price + addonsTotal) * item.quantity
    }, 0)
  },
  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))

