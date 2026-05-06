import { create } from 'zustand';

interface Admin {
  id: string;
  username: string;
  role: 'admin' | 'superadmin';
}

interface AdminState {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  setAdmin: (admin) => set({ admin }),
  logout: () => set({ admin: null }),
}));
