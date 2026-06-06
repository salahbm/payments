export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

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
