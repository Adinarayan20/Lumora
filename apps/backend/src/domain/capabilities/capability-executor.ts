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
      this.metricsRegistry?.queueJobDurationSeconds?.observe(
        { queue: 'capability_execution', event_type: 'pipeline' },
        durationSec,
      );

      return Result.ok<void>(undefined);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `CapabilityExecutor pipeline execution failed: ${errMsg}`,
      );
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

    // Run parallel execution policy capabilities concurrently
    if (parallelCaps.length > 0) {
      await Promise.all(
        parallelCaps.map((cap) =>
          this.executeCapabilityHook(cap, hookName, runtime, context),
        ),
      );
    }

    // Run sequential / exclusive capabilities serially
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

    let attempts = 0;
    const maxAttempts = cap.failurePolicy === FailurePolicy.RETRY ? 3 : 1;

    while (attempts < maxAttempts) {
      attempts += 1;
      try {
        await hookFn(runtime, context);
        return; // Success
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (handler?.onFailure) {
          try {
            await handler.onFailure(runtime, context, err);
          } catch (onFailureErr) {
            this.logger.error(
              `Capability '${cap.key}' onFailure handler failed: ${onFailureErr instanceof Error ? onFailureErr.message : String(onFailureErr)}`,
            );
          }
        }

        if (attempts < maxAttempts) {
          this.logger.warn(
            `Retrying capability '${cap.key}' hook '${hookName}' (attempt ${attempts}/${maxAttempts})...`,
          );
          continue;
        }

        if (cap.failurePolicy === FailurePolicy.FAIL_FAST) {
          throw err;
        } else if (cap.failurePolicy === FailurePolicy.IGNORE) {
          return; // Ignore completely without warning log
        } else {
          this.logger.warn(
            `Capability '${cap.key}' hook '${hookName}' failed with failurePolicy=${cap.failurePolicy}: ${err.message}`,
          );
          return;
        }
      }
    }
  }
}
