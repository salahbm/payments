import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/lib/agent';
import { ApiError } from '@/lib/api-error';
import { getAuthorizationHeaders } from '@/lib/auth-token';

import { environmentSchema } from '@/constants/environment';

import { TransactionsResponse } from '@/types/transaction';

export async function GET(request: NextRequest) {
  const authorizationHeaders = await getAuthorizationHeaders();

  if (!authorizationHeaders) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const envResult = environmentSchema.safeParse(searchParams.get('env'));

  if (!envResult.success) {
    return NextResponse.json(
      { message: 'Invalid environment' },
      { status: 400 },
    );
  }

  try {
    const data = await api.get<TransactionsResponse>('/api/transactions', {
      headers: authorizationHeaders,
      params: {
        cursor: searchParams.get('cursor'),
        env: envResult.data,
        limit: searchParams.get('limit') ?? 20,
      },
    });

    return NextResponse.json(data);
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
