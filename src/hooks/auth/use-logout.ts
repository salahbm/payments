import { useMutation } from '@tanstack/react-query';

import { useUserStore } from '@/store/user-store';

const logout = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export const useLogout = () => {
  const { removeUser } = useUserStore();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      removeUser();
      window.location.href = '/sign-in';
    },
  });
};
