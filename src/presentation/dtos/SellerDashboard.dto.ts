import { ApiProperty } from '@nestjs/swagger';

export class SellerDashboardDto {
    @ApiProperty({ example: 1 })
    vendorId: number;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: 'Ma boutique' })
    shopName: string;

    @ApiProperty({ example: 'https://ma-boutique.com', required: false })
    shopUrl?: string;

    @ApiProperty({ example: 'Description de la boutique', required: false })
    shopDescription?: string;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    shopCreatedAt: string;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    shopUpdatedAt: string;
}

export class SellerShopListItemDto {
    @ApiProperty({ example: 1 })
    shopId: number;
    @ApiProperty({ example: 'Ma boutique' })
    shopName: string;
    @ApiProperty({ example: 'https://ma-boutique.com', required: false })
    shopUrl?: string;
    @ApiProperty({ example: 'Description de la boutique', required: false })
    shopDescription?: string;
    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    shopCreatedAt: string;
    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    shopUpdatedAt: string;
}

export class SellerShopsListDto {
    @ApiProperty({ example: 1 })
    vendorId: number;
    @ApiProperty({ example: 1 })
    userId: number;
    @ApiProperty({ type: [SellerShopListItemDto] })
    shops: SellerShopListItemDto[];
} 