interface PaginateOptions<T> {
  model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  };
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
  page?: number;
  limit?: number;
}

interface PaginateResults<T> {
  data: T[];
  pagination: {
    totalItem: number;
    currentPage: number;
    limit: number;
    totalPage: number;
  };
}

export async function Npaginate<T = any>({
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
    pagination: {
      totalItem: total,
      currentPage: page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
}
