import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Environment } from '@/types/transaction';

interface EnvironmentStore {
  environment: Environment;
  setEnvironment: (environment: Environment) => void;
}

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      environment: 'sandbox',
      setEnvironment: (environment: Environment) => set({ environment }),
    }),
    {
      name: 'environment-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
