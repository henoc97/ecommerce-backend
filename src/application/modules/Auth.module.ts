import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../../presentation/controllers/Auth.controller';
import { UserService } from '../services/user.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { PassportConfig } from '../config/passport.config';

@Module({
    controllers: [AuthController],
    providers: [AuthService, UserService, UserPrismaRepository, PassportConfig],
    exports: [AuthService],
})
export class AuthModule { } 