import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  public getLiveness(@Res() res: Response): void {
    const result = this.healthService.checkLiveness();
    res.status(HttpStatus.OK).json(result);
  }

  @Get('startup')
  public getStartup(@Res() res: Response): void {
    const result = this.healthService.checkStartup();
    const statusCode =
      result.status === 'up' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(result);
  }

  @Get('ready')
  public async getReadiness(@Res() res: Response): Promise<void> {
    const result = await this.healthService.checkReadiness();
    const statusCode =
      result.status === 'up' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(result);
  }
}
