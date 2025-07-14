import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';

export class CategoryCreateDto {
    @ApiProperty({ example: 'Électronique' })
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    parentId?: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsInt()
    shopId: number;
}

export class CategoryUpdateDto {
    @ApiProperty({ example: 'Nouveau nom', required: false })
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    parentId?: number;
}

export class CategoryResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    parentId?: number;

    @ApiProperty({ required: false })
    shopId?: number;

    @ApiProperty({ required: false, type: [CategoryResponseDto] })
    children?: CategoryResponseDto[];
} 