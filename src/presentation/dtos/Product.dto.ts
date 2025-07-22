import { Currency } from '../../domain/enums/Currency.enum';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from '../../domain/entities/Category.entity';
import { ProductVariantEntity } from '../../domain/entities/ProductVariant.entity';
import { DiscountType } from '../../domain/enums/DiscountType.enum';

export class ProductCreateDto {
    @ApiProperty({ example: 'T-shirt', description: 'Nom du produit' })
    name: string;

    @ApiProperty({ example: 'Un t-shirt confortable', required: false })
    description?: string;

    @ApiProperty({ example: ['size', 'color'], description: 'Clés de variantes (ex: taille, couleur)' })
    productVariantKeys: string[];

    @ApiProperty({ example: 1, description: 'ID de la catégorie' })
    categoryId: number;

    @ApiProperty({ example: 1, description: 'ID du shop' })
    shopId: number;
}

export class ProductUpdateDto {
    @ApiProperty({ example: 'T-shirt', required: false })
    name?: string;

    @ApiProperty({ example: 'Un t-shirt confortable', required: false })
    description?: string;

    @ApiProperty({ example: ['size', 'color'], required: false })
    productVariantKeys?: string[];

    @ApiProperty({ example: 1, required: false })
    categoryId?: number;
}

export class ProductResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ type: [String] })
    productVariantKeys: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    categoryId: number;

    @ApiProperty({ type: () => CategoryEntity, required: false })
    category?: CategoryEntity;

    @ApiProperty()
    shopId: number;

    @ApiProperty({ type: () => [ProductVariantEntity], required: false })
    productVariants?: ProductVariantEntity[];
}

export class ProductVariantCreateDto {
    @ApiProperty({ example: { size: 'M', color: 'Red' }, description: 'Attributs de la variante (ex: taille, couleur)', type: 'object', additionalProperties: true })
    attributes: any;

    @ApiProperty({ example: 10, description: 'Stock initial' })
    stock: number;

    @ApiProperty({ example: 19.99, description: 'Prix de la variante' })
    price: number;

    @ApiProperty({ enum: Currency, example: Currency.EUR, description: 'Devise' })
    currency: Currency;
}

export class ProductVariantResponseDto {
    @ApiProperty()
    id: number;
    @ApiProperty()
    productId: number;
    @ApiProperty()
    attributes: any;
    @ApiProperty()
    stock: number;
    @ApiProperty()
    price: number;
    @ApiProperty({ enum: Currency })
    currency: Currency;
}

export class ProductImageCreateDto {
    @ApiProperty({ example: 1, description: 'ID de la variante produit' })
    productVariantId: number;

    @ApiProperty({ example: 'https://cdn.maboutique.com/img/variant1.jpg', description: 'URL de l\'image' })
    url: string;
}

export class PromotionCreateDto {
    @ApiProperty({ example: 'Promo été', description: 'Nom de la promotion' })
    name: string;

    @ApiProperty({ example: 10, description: 'Valeur de la réduction' })
    discountValue: number;

    @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE, description: 'Type de réduction' })
    discountType: DiscountType;

    @ApiProperty({ example: '2024-07-01T00:00:00.000Z', description: 'Date de début' })
    startDate: Date;

    @ApiProperty({ example: '2024-07-31T23:59:59.000Z', description: 'Date de fin' })
    endDate: Date;

    @ApiProperty({ required: false, example: 1, description: 'ID de la variante (optionnel si promo sur tout le produit)' })
    productVariantId?: number;

    @ApiProperty({ required: false, example: 1, description: 'ID du produit (optionnel si promo sur une variante)' })
    productId?: number;
}

export class PromotionResponseDto {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    discountValue: number;
    @ApiProperty({ enum: DiscountType })
    discountType: DiscountType;
    @ApiProperty()
    startDate: Date;
    @ApiProperty()
    endDate: Date;
    @ApiProperty()
    productVariantId: number;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
} 