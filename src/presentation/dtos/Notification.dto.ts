import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../domain/enums/NotificationType.enum';

export class NotificationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: NotificationType.PROMOTION, enum: NotificationType })
    type: NotificationType;

    @ApiProperty({ example: 'Promo -20% sur tout le site !' })
    content: string;

    @ApiProperty({ example: false })
    isRead: boolean;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    sentAt: string;
}

export class MarkNotificationAsReadDto {
    @ApiProperty({ example: true })
    isRead: boolean;
} 