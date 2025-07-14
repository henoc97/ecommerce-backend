import { ApiProperty } from "@nestjs/swagger";

export class UserActivityDto {
    @ApiProperty({ example: 'SEARCH', description: 'Type d\'action utilisateur' })
    action: string;
    @ApiProperty({ example: 'chaussure', required: false })
    keyword?: string;
    @ApiProperty({ example: 123, required: false })
    productId?: number;
    @ApiProperty({ example: 456, required: false })
    orderId?: number;
}