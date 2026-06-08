import { useInfiniteQuery } from '@tanstack/react-query';

import { app } from '@/lib/agent';
import { queryKeys } from '@/lib/query-keys';

import { Environment, TransactionsResponse } from '@/types/transaction';

interface GetTransactionsParams {
  environment: Environment;
  limit: number;
}

export const TRANSACTIONS_REFETCH_INTERVAL = 10_000;

const getTransactions = ({
  cursor,
  environment,
  limit,
}: GetTransactionsParams & { cursor?: string | null }) =>
  app.get<TransactionsResponse>('/api/transactions', {
    params: {
      cursor,
      env: environment,
      limit,
    },
  });

export const useGetTransactions = (params: GetTransactionsParams) =>
  useInfiniteQuery({
    queryKey: [...queryKeys.transactions.list, { ...params }],
    queryFn: ({ pageParam }) =>
      getTransactions({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
