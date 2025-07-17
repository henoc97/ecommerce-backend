import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
    @ApiProperty({ example: 1 })
    shopId: number;
}