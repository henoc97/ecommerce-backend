import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
    @ApiProperty({ example: 1, description: 'ID de l’utilisateur' })
    userId: number;

    @ApiProperty({ example: 10, description: 'ID de la variante du produit' })
    productVariantId: number;

    @ApiProperty({ example: 5, description: 'Note sur 5' })
    rating: number;

    @ApiProperty({ example: 'Super produit !', required: false })
    comment?: string;
}

export class ReviewResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 5 })
    rating: number;

    @ApiProperty({ example: 'Super produit !', required: false })
    comment?: string;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: 10 })
    productVariantId: number;
} 