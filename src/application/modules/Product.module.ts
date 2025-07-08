import { Module } from '@nestjs/common';
import { PassportConfig } from '../config/passport.config';
import { CategoryService } from '../services/category.service';
import { ProductController } from 'src/presentation/controllers/Product.controller';
import { ProductService } from '../services/product.service';
import { ProductPrismaRepository } from 'src/infrastructure/impl.repositories/ProductPrisma.repository';
import { CategoryPrismaRepository } from 'src/infrastructure/impl.repositories/CategoryPrisma.repository';

@Module({
    controllers: [ProductController],
    providers: [ProductService, CategoryService, ProductPrismaRepository, CategoryPrismaRepository],
    exports: [ProductService],
})
export class ProductModule { } 