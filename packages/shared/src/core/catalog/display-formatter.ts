/**
 * Display formatting rules for metadata attribute rendering.
 */
export interface DisplayFormatter {
  readonly format?: "currency" | "percent" | "date" | "datetime" | "time" | "badge" | "raw";
  readonly prefix?: string;
  readonly suffix?: string;
  readonly locale?: string;
  readonly precision?: number;
}
