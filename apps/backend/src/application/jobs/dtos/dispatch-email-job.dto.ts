export interface DispatchEmailJobDto {
  readonly recipientEmail: string;
  readonly subject: string;
  readonly template: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId?: string;
}
