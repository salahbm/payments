import { useQuery } from '@tanstack/react-query';

import { app } from '@/lib/agent';
import { queryKeys } from '@/lib/query-keys';

import { Environment, Transaction } from '@/types/transaction';

import { TRANSACTIONS_REFETCH_INTERVAL } from './use-get-transactions';

interface GetTransactionParams {
  environment: Environment;
  id: string;
}

const getTransaction = ({ environment, id }: GetTransactionParams) =>
  app.get<Transaction>(`/api/transactions/${id}`, {
    params: {
      env: environment,
    },
  });

export const useGetTransaction = (params: GetTransactionParams) =>
  useQuery({
    queryKey: [...queryKeys.transactions.detail, { ...params }],
    queryFn: () => getTransaction(params),
    refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
