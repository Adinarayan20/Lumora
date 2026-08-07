export interface ShutdownStepResult {
  readonly stepName: string;
  readonly status: 'success' | 'failed' | 'skipped' | 'timeout';
  readonly durationMs: number;
  readonly error?: string;
}

export interface ShutdownOptions {
  readonly timeoutMs?: number;
}

export interface IInfrastructureDestroyable {
  onModuleDestroy(): Promise<void>;
}

export function isDestroyable(
  target: unknown,
): target is IInfrastructureDestroyable {
  return (
    typeof target === 'object' &&
    target !== null &&
    'onModuleDestroy' in target &&
    typeof (target as Record<string, unknown>).onModuleDestroy === 'function'
  );
}
