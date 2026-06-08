import { cookies } from 'next/headers';

import 'server-only';

import { COOKIE_KEYS } from '@/constants/cookies';

export const getAccessToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
};

export const getAuthorizationHeaders = async () => {
  const token = await getAccessToken();

  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
};
