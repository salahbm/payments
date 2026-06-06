import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { User } from '@/types/user.type';

interface UserStore {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  removeUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      setUser: (user: User) => set({ user, isLoggedIn: true }),
      setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
      removeUser: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
