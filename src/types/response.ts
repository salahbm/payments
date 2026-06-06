export interface ApiResponse<T> {
  data: T;
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
