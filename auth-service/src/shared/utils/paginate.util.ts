// src/common/utils/paginate.ts
import { Prisma } from '@prisma/client';

interface PaginateOptions {
  page?: number;
  limit?: number;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
  model: {
    findMany: Function;
    count: Function;
  };
}

export async function paginate<T>({
  model,
  page = 1,
  limit = 10,
  where = {},
  orderBy = { createdAt: 'desc' },
}: PaginateOptions): Promise<{
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}> {
  const [data, totalItems] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    model.count({ where }),
  ]);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      currentPage: page,
      pageSize: limit,
      totalPages,
      totalItems,
    },
  };
}
