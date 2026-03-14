export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}
