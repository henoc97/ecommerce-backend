import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { OrderEntity } from 'src/domain/entities/Order.entity';
import { RefundStatus } from 'src/domain/enums/RefundStatus.enum';

export class CreateRefundDto {
    @ApiProperty({ example: 123 })
    @IsInt()
    orderId: number;

    @ApiProperty({ example: 'Produit défectueux' })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ example: 49.99 })
    @IsNumber()
    @Min(0.01)
    amount: number;
}

export class RefundResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderId: number;

    @ApiProperty({ type: () => OrderEntity })
    order: OrderEntity;

    @ApiProperty()
    reason: string;

    @ApiProperty()
    amount: number;

    @ApiProperty({ enum: RefundStatus })
    status: RefundStatus;

    @ApiProperty()
    createdAt: Date;
} 