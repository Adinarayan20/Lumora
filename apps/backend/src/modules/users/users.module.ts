import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import {
  GetProfileQuery,
  UpdateProfileUseCase,
  GetUserDevicesQuery,
  TrustDeviceUseCase,
  GetUserSessionsQuery,
  RevokeSessionUseCase,
} from './use-cases/user-use-cases';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    GetProfileQuery,
    UpdateProfileUseCase,
    GetUserDevicesQuery,
    TrustDeviceUseCase,
    GetUserSessionsQuery,
    RevokeSessionUseCase,
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
