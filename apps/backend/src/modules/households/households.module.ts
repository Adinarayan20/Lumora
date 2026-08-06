import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaHouseholdRepository } from '../../infrastructure/prisma/repositories/prisma-household.repository.js';
import { HOUSEHOLD_REPOSITORY_TOKEN } from './households.tokens.js';
import { CreateHouseholdUseCase } from './use-cases/create-household.use-case.js';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: HOUSEHOLD_REPOSITORY_TOKEN,
      useClass: PrismaHouseholdRepository,
    },
    CreateHouseholdUseCase,
  ],
  exports: [CreateHouseholdUseCase, HOUSEHOLD_REPOSITORY_TOKEN],
})
export class HouseholdsModule {}
