import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IdGenerator } from '@lumora/shared';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export interface RequestWithCorrelation extends Request {
  correlationId?: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelation, res: Response, next: NextFunction): void {
    const existingId = req.headers[CORRELATION_ID_HEADER];
    const correlationId =
      typeof existingId === 'string' && existingId.trim().length > 0
        ? existingId.trim()
        : IdGenerator.generate();

    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
