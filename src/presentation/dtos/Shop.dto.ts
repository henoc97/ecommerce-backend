import { ApiProperty } from '@nestjs/swagger';

export class CreateShopDto {
    @ApiProperty({ example: 'Ma boutique' })
    name: string;
    @ApiProperty({ example: 'ma-boutique', description: 'URL unique de la boutique' })
    url: string;
    @ApiProperty({ example: 'Description de la boutique', required: false })
    description?: string;
}

export class UpdateShopDto {
    @ApiProperty({ example: 'Ma boutique', required: false })
    name?: string;
    @ApiProperty({ example: 'ma-boutique', required: false })
    url?: string;
    @ApiProperty({ example: 'Description de la boutique', required: false })
    description?: string;
}

export class CreateSubsiteDto {
    @ApiProperty({ example: 'Mon sous-site' })
    title: string;
    @ApiProperty({ example: { theme: 'dark', layout: 'modern' }, type: 'object', additionalProperties: true })
    config: any;
    @ApiProperty({ example: 1 })
    shopId: number;
}

export class ShopSubscriptionDto {
    @ApiProperty({ example: 1 })
    shopId: number;
    @ApiProperty({ example: 2 })
    subscriptionId: number;
} 