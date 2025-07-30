interface PaginateOptions<T> {
  model: {
    findMany: Function;
    count: Function;
  };
  where?: T;
  select?: any;
  include?: any;
  orderBy?: any;
  page?: number;
  limit?: number;
}

interface PaginateResults<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  };
}

export async function paginate<T = any>({
  model,
  where,
  select,
  include,
  orderBy = { createdAt: 'desc' },
  page = 1,
  limit = 10,
}: PaginateOptions<T>): Promise<PaginateResults<T>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      select,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
  };
}
