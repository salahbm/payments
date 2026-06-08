export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiPaginatedApiResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
