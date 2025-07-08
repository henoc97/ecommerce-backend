import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../../presentation/controllers/Auth.controller';
import { UserService } from '../services/user.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';

@Module({
    controllers: [AuthController],
    providers: [AuthService, UserService, UserPrismaRepository],
    exports: [AuthService],
})
export class AuthModule { } 