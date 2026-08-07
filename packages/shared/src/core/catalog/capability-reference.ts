/**
 * Versioned capability reference contract.
 */
export interface CapabilityReference {
  readonly key: string;
  readonly version: string;
  readonly enabled?: boolean;
  readonly config?: Record<string, unknown>;
}
