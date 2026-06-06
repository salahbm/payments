import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/lib/agent';
import { ApiError } from '@/lib/api-error';

import { COOKIE_KEYS } from '@/constants/cookies';

import { env } from '@/env';
import { ApiResponse } from '@/types/response';
import { User } from '@/types/user.type';

/**
 * I set 8 hrs for the token to be valid
 * Depending on the project security requirements, we can change this value
 *
 * But max age should come from backend response for better security and unified configuration
 *
 * For example:
 * - 15 min for high security applications
 * - 1 hour for medium security applications
 * - 8 hours for low security applications
 */
const TOKEN_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

interface LoginResponse {
  token: string;
  user: User;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = await api.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      body,
    );

    // Set httpOnly cookie server-side — never exposed to client JS
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, data.data.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    });

    // Return user data without the token
    return NextResponse.json({
      code: data.code,
      message: data.message,
      data: { user: data.data.user },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, data: error.data },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
