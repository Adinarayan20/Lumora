export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly requestId: string;
  readonly parentSpanId?: string;
  readonly startTime: number;
}
