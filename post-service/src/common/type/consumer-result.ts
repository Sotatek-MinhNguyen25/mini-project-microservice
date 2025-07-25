export type ConsumerResult<T> = {
  data: T;
  meta?: {
    currentPage: number;
    totalPage: number;
    totalItem: number;
    limit: number;
  };
};
