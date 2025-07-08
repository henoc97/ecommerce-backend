import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { PassportConfig } from '../config/passport.config';
import { UserProfileController } from 'src/presentation/controllers/UserProfile.controller';
import { AddressService } from '../services/address.service';
import { AddressPrismaRepository } from 'src/infrastructure/impl.repositories/AddressPrisma.repository';

@Module({
    controllers: [UserProfileController],
    providers: [AddressService, UserService, UserPrismaRepository, AddressPrismaRepository, PassportConfig],
    exports: [AddressService],
})
export class UserProfileModule { } 