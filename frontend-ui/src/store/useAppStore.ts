'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AppState {
  user: User | null;
  selectedElementId: number | null;
  searchQuery: string;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setSelectedElementId: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
}

// Auth lives in an httpOnly cookie (not accessible to JS). We only persist the
// non-sensitive user object to know who is logged in and render role-based UI.
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      selectedElementId: null,
      searchQuery: '',
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null, selectedElementId: null, searchQuery: '' }),
      setSelectedElementId: (id) => set({ selectedElementId: id, searchQuery: '' }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'testflow-auth',
      partialize: (state) => ({ user: state.user, selectedElementId: state.selectedElementId }),
    }
  )
);
