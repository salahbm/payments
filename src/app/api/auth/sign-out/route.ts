import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { COOKIE_KEYS } from '@/constants/cookies';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_KEYS.ACCESS_TOKEN);

  return NextResponse.json({ message: 'Logged out' });
}
