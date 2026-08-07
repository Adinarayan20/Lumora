export type HealthStatus = 'up' | 'down';

export interface DependencyHealthStatus {
  readonly status: HealthStatus;
  readonly durationMs?: number;
  readonly error?: string;
}

export interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly timestamp: string;
  readonly version?: string;
  readonly durationMs: number;
  readonly details: Record<string, DependencyHealthStatus>;
}
