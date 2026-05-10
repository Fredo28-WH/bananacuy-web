import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SettingState {
  isStoreOpen: boolean;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingStore = create<SettingState>((set) => ({
  isStoreOpen: true, // Default to true
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data } = supabase.storage.from("store_assets").getPublicUrl("store_status.json");
      if (data?.publicUrl) {
        const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.isOpen === "boolean") {
            set({ isStoreOpen: json.isOpen });
          }
        }
      }
    } catch (e) {
      console.log("Failed to fetch store status, defaulting to open.");
    } finally {
      set({ isLoading: false });
    }
  }
}));
