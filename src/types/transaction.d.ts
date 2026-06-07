export type Environment = 'sandbox' | 'production';

export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface TransactionCustomer {
  id?: string;
  name: string;
  email: string;
}

export interface TransactionPaymentMethod {
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface TransactionEvent {
  type: string;
  at: string;
}

export interface TransactionMetadata {
  order_id?: string;
  failure_reason?: string;
}

export interface TransactionListItem {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  customer: TransactionCustomer;
  created_at: string;
}

export interface Transaction extends TransactionListItem {
  payment_method: TransactionPaymentMethod;
  events: TransactionEvent[];
  metadata: TransactionMetadata;
}

export interface TransactionsResponse {
  data: TransactionListItem[];
  has_more: boolean;
  next_cursor: string | null;
}
