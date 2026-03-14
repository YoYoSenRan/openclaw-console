export abstract class BaseController {
  protected parsePage(query: Record<string, unknown>): { page: number; size: number } {
    const page = Math.max(1, Number(query.page) || 1);
    const size = Math.min(Math.max(1, Number(query.size) || 20), 200);
    return { page, size };
  }

  // 过滤掉分页参数，剩余字段作为 where 条件
  protected parseWhere(query: Record<string, unknown>): Record<string, unknown> {
    const { page: _p, size: _s, ...where } = query;
    return where;
  }
}
