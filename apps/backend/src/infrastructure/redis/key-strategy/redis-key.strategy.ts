export class RedisKeyStrategy {
  private static readonly NAMESPACE_PREFIX = 'lumora:';

  public static workspaceKey(workspaceId: string): string {
    return `${this.NAMESPACE_PREFIX}workspace:${workspaceId}`;
  }

  public static objectKey(objectId: string): string {
    return `${this.NAMESPACE_PREFIX}object:${objectId}`;
  }

  public static userKey(userId: string): string {
    return `${this.NAMESPACE_PREFIX}user:${userId}`;
  }

  public static rateLimitKey(identifier: string): string {
    return `${this.NAMESPACE_PREFIX}rate-limit:${identifier}`;
  }

  public static tokenKey(userId: string): string {
    return `${this.NAMESPACE_PREFIX}token:${userId}`;
  }

  public static customKey(namespace: string, id: string): string {
    return `${this.NAMESPACE_PREFIX}${namespace}:${id}`;
  }
}
