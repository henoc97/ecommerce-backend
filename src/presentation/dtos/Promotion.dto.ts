import { IsInt, IsOptional, IsString, IsNumber, IsEnum, IsDateString, ValidateIf } from 'class-validator';
import { DiscountType } from '../../domain/enums/DiscountType.enum';

export class DeletePromotionDto {
    @IsOptional()
    @IsInt()
    productId?: number;

    @IsOptional()
    @IsInt()
    productVariantId?: number;
}

export class UpdatePromotionDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    discountValue?: number;

    @IsOptional()
    @IsEnum(DiscountType)
    discountType?: DiscountType;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsInt()
    productId?: number;

    @IsOptional()
    @IsInt()
    productVariantId?: number;
} 