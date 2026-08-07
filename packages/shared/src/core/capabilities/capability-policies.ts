/**
 * Defines execution dispatch strategy for capabilities.
 */
export enum ExecutionPolicy {
  SEQUENTIAL = "SEQUENTIAL",
  PARALLEL = "PARALLEL",
  EXCLUSIVE = "EXCLUSIVE",
  OPTIONAL = "OPTIONAL",
}

/**
 * Defines error handling strategy when a capability hook or execution fails.
 */
export enum FailurePolicy {
  FAIL_FAST = "FAIL_FAST",
  CONTINUE = "CONTINUE",
  RETRY = "RETRY",
  IGNORE = "IGNORE",
  COMPENSATE = "COMPENSATE",
}
