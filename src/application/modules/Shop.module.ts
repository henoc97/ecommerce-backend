import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { PassportConfig } from '../config/passport.config';
import { AddressService } from '../services/address.service';
import { AddressPrismaRepository } from 'src/infrastructure/impl.repositories/AddressPrisma.repository';
import { ShopController } from 'src/presentation/controllers/Shop.controller';
import { ShopService } from '../services/shop.service';
import { CategoryService } from '../services/category.service';
import { ShopPrismaRepository } from 'src/infrastructure/impl.repositories/ShopPrisma.repository';
import { CategoryPrismaRepository } from 'src/infrastructure/impl.repositories/CategoryPrisma.repository';

@Module({
    controllers: [ShopController],
    providers: [ShopService, CategoryService, ShopPrismaRepository, CategoryPrismaRepository,],
    exports: [ShopService],
})
export class ShopModule { } 