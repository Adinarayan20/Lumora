import { Injectable, LoggerService } from '@nestjs/common';
import { TraceContextService } from './trace-context.service.js';

@Injectable()
export class StructuredLoggerProvider implements LoggerService {
  constructor(private readonly traceContextService: TraceContextService) {}

  public log(message: unknown, context?: string): void {
    this.printLog('INFO', message, context);
  }

  public error(message: unknown, trace?: string, context?: string): void {
    this.printLog('ERROR', message, context, trace);
  }

  public warn(message: unknown, context?: string): void {
    this.printLog('WARN', message, context);
  }

  public debug(message: unknown, context?: string): void {
    this.printLog('DEBUG', message, context);
  }

  public verbose(message: unknown, context?: string): void {
    this.printLog('VERBOSE', message, context);
  }

  private printLog(
    level: string,
    message: unknown,
    context?: string,
    stack?: string,
  ): void {
    const traceCtx = this.traceContextService.getContext();

    let formattedMessage: string;
    if (message instanceof Error) {
      formattedMessage = message.message;
    } else if (typeof message === 'object' && message !== null) {
      formattedMessage = JSON.stringify(message);
    } else {
      formattedMessage = String(message);
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      traceId: traceCtx?.traceId || 'none',
      spanId: traceCtx?.spanId || 'none',
      requestId: traceCtx?.requestId || 'none',
      level,
      context: context || 'Application',
      message: formattedMessage,
      ...(stack ? { stack } : {}),
    };

    const output = JSON.stringify(logEntry);
    if (level === 'ERROR') {
      process.stderr.write(`${output}\n`);
    } else {
      process.stdout.write(`${output}\n`);
    }
  }
}
