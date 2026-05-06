import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SettingState {
  logoUrl: string | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateLogoUrl: (url: string) => Promise<void>;
}

export const useSettingStore = create<SettingState>((set) => ({
  logoUrl: null,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    // Assuming we have a 'settings' table with a single row 'id = 1'
    const { data, error } = await supabase
      .from('settings')
      .select('logo_url')
      .eq('id', 1)
      .single();
      
    if (!error && data) {
      set({ logoUrl: data.logo_url, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateLogoUrl: async (url: string) => {
    set({ isLoading: true });
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, logo_url: url });
      
    if (!error) {
      set({ logoUrl: url, isLoading: false });
    } else {
      console.error(error);
      set({ isLoading: false });
    }
  }
}));
