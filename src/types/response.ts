export interface ApiPaginatedApiResponse<T> {
  code: number;
  message: string;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
