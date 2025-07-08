import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../../presentation/controllers/Auth.controller';
import { UserService } from '../services/user.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { PassportConfig } from '../config/passport.config';
import { AddressPrismaRepository } from 'src/infrastructure/impl.repositories/AddressPrisma.repository';
import { AddressService } from '../services/address.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, UserService, AddressService, UserPrismaRepository, AddressPrismaRepository, PassportConfig],
    exports: [AuthService],
})
export class AuthModule { } 