export class JsonSerializer {
  public static serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  public static deserialize<T>(payload: string): T | null {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return null;
    }
  }
}
