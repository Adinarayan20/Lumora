export const WORKSPACE_CACHE_TOKEN = Symbol('IWorkspaceCache');

export interface IWorkspaceCache {
  get<T = unknown>(workspaceId: string): Promise<T | null>;
  set<T = unknown>(
    workspaceId: string,
    data: T,
    ttlSeconds?: number,
  ): Promise<void>;
  delete(workspaceId: string): Promise<void>;
}
