/**
 * Custom error class for API responses.
 * Thrown by the API layer when a request fails.
 */
interface ApiErrorResponse {
  message?: string;
  data?: {
    error?: string;
  };
}

const fallbackMessage = 'Something went wrong';

export const getApiErrorMessage = (message: string, data?: unknown): string => {
  const errorData = data as ApiErrorResponse | undefined;

  return (
    errorData?.data?.error ?? errorData?.message ?? message ?? fallbackMessage
  );
};

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly responseMessage: string;

  constructor(status: number, message: string, data?: unknown) {
    super(getApiErrorMessage(message, data));
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.responseMessage = message;
  }

  /** True if the error is a client error (4xx) */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** True if the error is a server error (5xx) */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /** True if the error is a network/connection failure */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}
