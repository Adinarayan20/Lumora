export interface ShutdownStepResult {
  readonly stepName: string;
  readonly status: 'success' | 'failed' | 'skipped';
  readonly durationMs: number;
  readonly error?: string;
}

export interface ShutdownOptions {
  readonly timeoutMs?: number;
}
