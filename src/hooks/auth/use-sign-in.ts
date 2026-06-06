import { useMutation, useQueryClient } from '@tanstack/react-query';

import { app } from '@/lib/agent';
import { queryKeys } from '@/lib/query-keys';

import { useUserStore } from '@/store/user-store';
import { ApiResponse } from '@/types/response';
import { User } from '@/types/user.type';

import { SignInType } from './auth.schema';

/**
 * I have not used direct Backend call because I want to use the Next.js Route Handler
 * which sets httpOnly cookie server-side
 *
 * Why? Because httpOnly cookies are not accessible from client-side JavaScript
 * and they are automatically sent with every request to the server
 *
 * Also Clerk, Vercel and other major auth providers use Next.js Route Handler to set httpOnly cookies
 * and this is the standard way to handle authentication as BFF (Backend for Frontend)
 *
 * const signIn = (values: SignInType) =>
 * agent.post<ApiResponse<{ user: User }>>('/api/auth/login', values);
 */

// Calls the Next.js Route Handler which sets httpOnly cookie server-side to follow BFF pattern
const signIn = async (values: SignInType) =>
  await app.post<ApiResponse<{ user: User }>>('/api/auth/sign-in', values);

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsLoggedIn } = useUserStore();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      setUser(data.data.user);
      setIsLoggedIn(true);
      queryClient.invalidateQueries({
        // Invalidate auth cache for this user, Spead the key and pass the id is recommended by TanStack Query docs
        queryKey: [...queryKeys.auth.all, { id: data.data.user.id }],
      });
    },
  });
};
