import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  Result,
  CapabilityId,
  FailurePolicy,
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
      for (const cap of activeCaps) {
        const handler = this.handlers.get(cap.key);
        if (handler?.beforeValidation) {
          await this.safelyExecuteHook(
            cap,
            'beforeValidation',
            () => handler.beforeValidation!(runtime, context),
            runtime,
            context,
          );
        }
      }

      // 2. BEFORE_EXECUTION
      for (const cap of activeCaps) {
        const handler = this.handlers.get(cap.key);
        if (handler?.beforeExecution) {
          await this.safelyExecuteHook(
            cap,
            'beforeExecution',
            () => handler.beforeExecution!(runtime, context),
            runtime,
            context,
          );
        }
      }

      // 3. BEFORE_COMMIT
      for (const cap of activeCaps) {
        const handler = this.handlers.get(cap.key);
        if (handler?.beforeCommit) {
          await this.safelyExecuteHook(
            cap,
            'beforeCommit',
            () => handler.beforeCommit!(runtime, context),
            runtime,
            context,
          );
        }
      }

      // 4. CORE ACTION MUTATION
      await updateAction();

      // 5. AFTER_COMMIT
      for (const cap of activeCaps) {
        const handler = this.handlers.get(cap.key);
        if (handler?.afterCommit) {
          await this.safelyExecuteHook(
            cap,
            'afterCommit',
            () => handler.afterCommit!(runtime, context),
            runtime,
            context,
          );
        }
      }

      // 6. AFTER_EXECUTION
      for (const cap of activeCaps) {
        const handler = this.handlers.get(cap.key);
        if (handler?.afterExecution) {
          await this.safelyExecuteHook(
            cap,
            'afterExecution',
            () => handler.afterExecution!(runtime, context),
            runtime,
            context,
          );
        }
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

  private async safelyExecuteHook(
    cap: CapabilityDescriptor,
    hookName: string,
    hookCall: () => Promise<void>,
    runtime: LumoraObjectRuntime,
    context: ExecutionContext,
  ): Promise<void> {
    try {
      await hookCall();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const handler = this.handlers.get(cap.key);
      if (handler?.onFailure) {
        await handler.onFailure(runtime, context, err);
      }

      if (cap.failurePolicy === FailurePolicy.FAIL_FAST) {
        throw err;
      } else {
        this.logger.warn(
          `Capability '${cap.key}' hook '${hookName}' failed with failurePolicy=${cap.failurePolicy}: ${err.message}`,
        );
      }
    }
  }
}
