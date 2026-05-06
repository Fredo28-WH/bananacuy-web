import { create } from 'zustand';
import { Addon } from './cartStore';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
}

export interface Topping extends Addon {
  id: string;
}

interface ProductState {
  products: Product[];
  toppings: Topping[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTopping: (topping: Omit<Topping, 'id'>) => Promise<void>;
  updateTopping: (id: string, data: Partial<Topping>) => Promise<void>;
  deleteTopping: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  toppings: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    
    // Fetch Products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
      
    // Fetch Toppings
    const { data: toppingsData, error: toppingsError } = await supabase
      .from('toppings')
      .select('*')
      .order('created_at', { ascending: true });

    if (!productsError && !toppingsError) {
      set({ 
        products: productsData?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          isActive: p.is_active
        })) || [], 
        toppings: toppingsData || [] 
      });
    }
    set({ isLoading: false });
  },

  addProduct: async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        is_active: product.isActive
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      alert("Gagal menambahkan menu: " + error.message);
      return;
    }

    if (data) {
      set((state) => ({
        products: [...state.products, {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          isActive: data.is_active
        }]
      }));
    }
  },

  updateProduct: async (id, data) => {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.price !== undefined) updatePayload.price = data.price;
    if (data.image !== undefined) updatePayload.image = data.image;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error("Error updating product:", error);
      alert("Gagal mengupdate menu: " + error.message);
      return;
    }

    set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
    }));
  },

  deleteProduct: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting product:", error);
      alert("Gagal menghapus menu: " + error.message);
      return;
    }

    set((state) => ({
      products: state.products.filter(p => p.id !== id)
    }));
  },

  addTopping: async (topping) => {
    const { data, error } = await supabase
      .from('toppings')
      .insert([topping])
      .select()
      .single();

    if (error) {
      console.error("Error adding topping:", error);
      alert("Gagal menambahkan topping: " + error.message);
      return;
    }

    if (data) {
      set((state) => ({ toppings: [...state.toppings, data] }));
    }
  },

  updateTopping: async (id, data) => {
    const { error } = await supabase
      .from('toppings')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error("Error updating topping:", error);
      alert("Gagal mengupdate topping: " + error.message);
      return;
    }

    set((state) => ({
      toppings: state.toppings.map(t => t.id === id ? { ...t, ...data } : t)
    }));
  },

  deleteTopping: async (id) => {
    const { error } = await supabase
      .from('toppings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting topping:", error);
      alert("Gagal menghapus topping: " + error.message);
      return;
    }

    set((state) => ({
      toppings: state.toppings.filter(t => t.id !== id)
    }));
  }
}));
