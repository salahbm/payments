import { useMutation } from '@tanstack/react-query';

import { app } from '@/lib/agent';
import { queryClient } from '@/lib/query-client';

import { routes } from '@/constants/routes';

import { useRouter } from '@/i18n/routing';
import { useUserStore } from '@/store/user-store';

const signOut = () => app.post<{ message: string }>('/api/auth/sign-out');

export const useSignOut = () => {
  const router = useRouter();
  const { removeUser } = useUserStore();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      removeUser();
      queryClient.clear();
      router.replace(routes.signIn);
    },
  });
};
