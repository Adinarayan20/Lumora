import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  Result,
  CapabilityId,
  FailurePolicy,
  ExecutionPolicy,
  CapabilityExecutedEvent,
  DomainValidationException,
} from '@lumora/shared';
import type { CapabilityDescriptor, ExecutionContext } from '@lumora/shared';
import type { CapabilityRegistry } from './capability-registry.js';
import type { MetricsRegistry } from '../../infrastructure/metrics/metrics.registry.js';
import type { LumoraObjectRuntime } from '../runtime/lumora-object-runtime.js';

export interface CapabilityHookHandler {
  beforeValidation?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ) => Promise<void>;
  beforeExecution?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ) => Promise<void>;
  beforeCommit?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ) => Promise<void>;
  afterCommit?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ) => Promise<void>;
  afterExecution?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ) => Promise<void>;
  onFailure?: (
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
    error: Error,
  ) => Promise<void>;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 2000,
  backoffFactor: 2,
};

@Injectable()
export class CapabilityExecutor {
  private readonly logger = new Logger(CapabilityExecutor.name);
  private readonly handlers = new Map<string, CapabilityHookHandler>();

  constructor(
    private readonly capabilityRegistry: CapabilityRegistry,
    @Optional() private readonly metricsRegistry?: MetricsRegistry,
  ) {}

  public registerHandler(
    capabilityId: CapabilityId | string,
    handler: CapabilityHookHandler,
  ): void {
    const key =
      typeof capabilityId === 'string'
        ? CapabilityId.create(capabilityId).toValue()
        : capabilityId.toValue();
    this.handlers.set(key, handler);
  }

  public async executePipeline(
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
    updateAction: () => Promise<void>,
  ): Promise<Result<void>> {
    const activeCaps = runtime.activeCapabilities
      .map((ref) => this.capabilityRegistry.get(ref.key))
      .filter((cap): cap is CapabilityDescriptor => cap !== null)
      .sort((a, b) => a.executionOrder - b.executionOrder);

    const startTime = Date.now();

    try {
      // 1. BEFORE_VALIDATION
      await this.dispatchPhase(
        activeCaps,
        'beforeValidation',
        runtime,
        context,
      );

      // 2. BEFORE_EXECUTION
      await this.dispatchPhase(activeCaps, 'beforeExecution', runtime, context);

      // 3. BEFORE_COMMIT
      await this.dispatchPhase(activeCaps, 'beforeCommit', runtime, context);

      // 4. CORE ACTION MUTATION
      await updateAction();

      // 5. AFTER_COMMIT
      await this.dispatchPhase(activeCaps, 'afterCommit', runtime, context);

      // 6. AFTER_EXECUTION
      await this.dispatchPhase(activeCaps, 'afterExecution', runtime, context);

      for (const cap of activeCaps) {
        runtime.recordDomainEvent(
          new CapabilityExecutedEvent(
            runtime.aggregate.id,
            runtime.aggregate.workspaceId,
            cap.key,
            'updateAttribute',
          ),
        );
      }

      const durationSec = (Date.now() - startTime) / 1000;
      this.metricsRegistry?.capabilityExecutionDurationSeconds?.observe(
        { capability: 'pipeline', status: 'success' },
        durationSec,
      );
      this.metricsRegistry?.capabilityExecutionsTotal?.inc({
        status: 'success',
      });

      return Result.ok<void>(undefined);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `CapabilityExecutor pipeline execution failed: ${errMsg}`,
      );
      this.metricsRegistry?.capabilityPipelineFailuresTotal?.inc();
      return Result.fail(new DomainValidationException(errMsg));
    }
  }

  private async dispatchPhase(
    caps: readonly CapabilityDescriptor[],
    hookName: keyof CapabilityHookHandler,
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ): Promise<void> {
    const parallelCaps = caps.filter(
      (c) => c.executionPolicy === ExecutionPolicy.PARALLEL,
    );
    const sequentialCaps = caps.filter(
      (c) => c.executionPolicy !== ExecutionPolicy.PARALLEL,
    );

    // Run parallel execution policy capabilities concurrently with Promise.allSettled
    if (parallelCaps.length > 0) {
      this.metricsRegistry?.capabilityParallelExecutionsTotal?.inc();
      const results = await Promise.allSettled(
        parallelCaps.map((cap) =>
          this.executeCapabilityHook(cap, hookName, runtime, context),
        ),
      );

      const failures: Error[] = [];
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          const cap = parallelCaps[index];
          const err =
            res.reason instanceof Error
              ? res.reason
              : new Error(String(res.reason));
          if (cap.failurePolicy === FailurePolicy.FAIL_FAST) {
            failures.push(err);
          }
        }
      });

      if (failures.length > 0) {
        throw failures[0];
      }
    }

    // Run sequential capabilities serially
    for (const cap of sequentialCaps) {
      await this.executeCapabilityHook(cap, hookName, runtime, context);
    }
  }

  private async executeCapabilityHook(
    cap: CapabilityDescriptor,
    hookName: keyof CapabilityHookHandler,
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ): Promise<void> {
    const handler = this.handlers.get(cap.key);
    const hookFn = handler?.[hookName] as
      | ((
          runtime: LumoraObjectRuntime,
          context: ExecutionContext,
        ) => Promise<void>)
      | undefined;
    if (!hookFn) return;

    const retryPolicy = DEFAULT_RETRY_POLICY;
    let attempts = 0;
    const maxAttempts =
      cap.failurePolicy === FailurePolicy.RETRY ? retryPolicy.maxAttempts : 1;

    while (attempts < maxAttempts) {
      attempts += 1;
      try {
        await hookFn(runtime, context);
        if (attempts > 1) {
          this.metricsRegistry?.capabilityRetrySuccessesTotal?.inc({
            capability: cap.key,
          });
        }
        return; // Success
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        // Non-retryable domain validation errors bypass retry logic
        if (err instanceof DomainValidationException) {
          if (handler?.onFailure) {
            await this.safelyCallOnFailure(handler, runtime, context, err);
          }
          this.metricsRegistry?.capabilityFailuresTotal?.inc({
            capability: cap.key,
            hook: hookName,
          });
          throw err;
        }

        if (handler?.onFailure) {
          await this.safelyCallOnFailure(handler, runtime, context, err);
        }

        if (attempts < maxAttempts) {
          this.metricsRegistry?.capabilityRetriesTotal?.inc({
            capability: cap.key,
          });
          const backoffMs = Math.min(
            retryPolicy.initialDelayMs *
              Math.pow(retryPolicy.backoffFactor, attempts - 1) +
              Math.floor(Math.random() * 50),
            retryPolicy.maxDelayMs,
          );
          this.logger.warn(
            `Retrying capability '${cap.key}' hook '${hookName}' (attempt ${attempts}/${maxAttempts}) after ${backoffMs}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        if (cap.failurePolicy === FailurePolicy.RETRY) {
          this.metricsRegistry?.capabilityRetryFailuresTotal?.inc({
            capability: cap.key,
          });
        }

        this.metricsRegistry?.capabilityFailuresTotal?.inc({
          capability: cap.key,
          hook: hookName,
        });

        if (cap.failurePolicy === FailurePolicy.FAIL_FAST) {
          throw err;
        } else if (cap.failurePolicy === FailurePolicy.IGNORE) {
          return; // Ignore silently
        } else {
          this.logger.warn(
            `Capability '${cap.key}' hook '${hookName}' failed with failurePolicy=${cap.failurePolicy}: ${err.message}`,
          );
          return;
        }
      }
    }
  }

  private async safelyCallOnFailure(
    handler: CapabilityHookHandler,
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
    error: Error,
  ): Promise<void> {
    try {
      if (handler.onFailure) {
        await handler.onFailure(runtime, context, error);
      }
    } catch (onFailureErr) {
      this.logger.error(
        `Capability onFailure handler failed: ${onFailureErr instanceof Error ? onFailureErr.message : String(onFailureErr)}`,
      );
    }
  }
}
