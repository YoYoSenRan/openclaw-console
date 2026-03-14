export abstract class BaseController {
  protected parsePage(query: Record<string, unknown>): { page: number; size: number } {
    const page = Math.max(1, Number(query.page) || 1);
    const size = Math.min(Math.max(1, Number(query.size) || 20), 200);
    return { page, size };
  }
}
