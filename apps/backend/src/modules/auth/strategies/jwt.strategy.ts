import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../users/repositories/user.repository';
import { JwtPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new InternalServerErrorException(
            'JWT_SECRET environment variable is not configured. Application cannot start without a valid JWT secret.',
          );
        }
        return secret;
      })(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User inactive or not found');
    }
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, unknown>).passwordHash;

    return {
      ...userWithoutPassword,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
    };
  }
}
