import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/lib/agent';
import { ApiError } from '@/lib/api-error';
import { getAuthorizationHeaders } from '@/lib/auth-token';

import { environmentSchema } from '@/constants/environment';

import { Transaction } from '@/types/transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorizationHeaders = await getAuthorizationHeaders();

  if (!authorizationHeaders) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const envResult = environmentSchema.safeParse(
    request.nextUrl.searchParams.get('env') ??
      request.headers.get('X-Environment'),
  );

  if (!envResult.success) {
    return NextResponse.json(
      { message: 'Invalid environment' },
      { status: 400 },
    );
  }

  try {
    const data = await api.get<Transaction>(`/api/transactions/${id}`, {
      headers: {
        ...authorizationHeaders,
        'X-Environment': envResult.data,
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
