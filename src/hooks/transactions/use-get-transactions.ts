import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { app } from '@/lib/agent';
import { queryKeys } from '@/lib/query-keys';

import { Environment, TransactionsResponse } from '@/types/transaction';

interface GetTransactionsParams {
  cursor?: string | null;
  environment: Environment;
  limit: number;
}

export const TRANSACTIONS_REFETCH_INTERVAL = 10_000;

const getTransactions = ({
  cursor,
  environment,
  limit,
}: GetTransactionsParams) =>
  app.get<TransactionsResponse>('/api/transactions', {
    params: {
      cursor,
      env: environment,
      limit,
    },
  });

export const useGetTransactions = (params: GetTransactionsParams) =>
  useQuery({
    queryKey: [...queryKeys.transactions.list, { ...params }],
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
    refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
