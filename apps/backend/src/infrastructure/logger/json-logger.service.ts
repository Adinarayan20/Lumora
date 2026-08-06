import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

export interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  correlationId?: string;
  workspaceId?: string;
  userId?: string;
  requestId?: string;
  command?: string;
  durationMs?: number;
  extra?: Record<string, unknown>;
}

export type LogContext = string | Partial<StructuredLogPayload>;

@Injectable()
export class JsonLoggerService implements LoggerService {
  private enabledLevels: Set<LogLevel> = new Set(['log', 'error', 'warn', 'debug', 'verbose']);

  log(message: string, context?: LogContext): void {
    this.writeLog('log', message, context);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    const extra = trace ? { trace } : undefined;
    this.writeLog('error', message, context, extra);
  }

  warn(message: string, context?: LogContext): void {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog('debug', message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.writeLog('verbose', message, context);
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    extra?: Record<string, unknown>,
  ): void {
    if (!this.enabledLevels.has(level)) return;

    let contextName = 'Application';
    let structuredFields: Partial<StructuredLogPayload> = {};

    if (typeof context === 'string') {
      contextName = context;
    } else if (context && typeof context === 'object') {
      const { context: ctxName, ...rest } = context;
      if (ctxName) contextName = ctxName;
      structuredFields = rest;
    }

    const payload: StructuredLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      context: contextName,
      message,
      ...structuredFields,
      ...(extra ? { extra: { ...structuredFields.extra, ...extra } } : {}),
    };

    process.stdout.write(JSON.stringify(payload) + '\n');
  }
}
