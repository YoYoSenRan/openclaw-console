import { PrismaService } from "../../prisma/prisma.service";

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// Prisma model delegate 最小接口
interface PrismaDelegate<T> {
  findMany(args?: object): Promise<T[]>;
  findUnique(args: object): Promise<T | null>;
  create(args: object): Promise<T>;
  upsert(args: object): Promise<T>;
  delete(args: object): Promise<T>;
  count(args?: object): Promise<number>;
}

export abstract class BaseService<T> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get delegate(): PrismaDelegate<T>;

  async add(data: object): Promise<T> {
    return this.delegate.create({ data });
  }

  async remove(id: string): Promise<T> {
    return this.delegate.delete({ where: { id } });
  }

  async detail(id: string): Promise<T | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async list(where: object = {}): Promise<T[]> {
    return this.delegate.findMany({ where });
  }

  async page(where: object = {}, page = 1, size = 20): Promise<PageResult<T>> {
    const [list, total] = await Promise.all([
      this.delegate.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
      }),
      this.delegate.count({ where }),
    ]);
    return { list, total, page, size };
  }
}
