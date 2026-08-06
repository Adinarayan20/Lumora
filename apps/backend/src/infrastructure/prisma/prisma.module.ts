import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { PrismaUnitOfWork } from './prisma-unit-of-work.js';
import { UNIT_OF_WORK } from '../../domain/common/unit-of-work/unit-of-work.interface.js';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUnitOfWork,
    {
      provide: UNIT_OF_WORK,
      useExisting: PrismaUnitOfWork,
    },
  ],
  exports: [PrismaService, PrismaUnitOfWork, UNIT_OF_WORK],
})
export class PrismaModule {}
