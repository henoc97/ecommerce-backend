import { ApiProperty } from "@nestjs/swagger";

export class AddCartItemDto {
    @ApiProperty({ example: 1 })
    productId: number;
    @ApiProperty({ example: 2 })
    quantity: number;
}

export class UpdateCartItemDto {
    @ApiProperty({ example: 3 })
    newQuantity: number;
}