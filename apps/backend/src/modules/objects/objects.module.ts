import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectRepository } from './repositories/object.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectRepository],
  exports: [ObjectsService, ObjectRepository],
})
export class ObjectsModule {}
