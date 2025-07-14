import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../domain/enums/TicketStatus.enum';

export class CreateTicketDto {
    @ApiProperty({ example: 1, description: 'ID de l’utilisateur' })
    userId: number;

    @ApiProperty({ example: 'Problème de livraison', description: 'Objet du ticket' })
    subject: string;

    @ApiProperty({ example: 'Je n’ai pas reçu mon colis.', description: 'Description du problème' })
    description: string;
}

export class TicketResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: TicketStatus.OPEN, enum: TicketStatus })
    status: TicketStatus;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2024-07-14T12:00:00.000Z' })
    updatedAt: string;

    @ApiProperty({ example: 'Problème de livraison' })
    subject: string;

    @ApiProperty({ example: 'Je n’ai pas reçu mon colis.' })
    description: string;

    @ApiProperty({ example: 'Votre colis est en route.', required: false })
    response?: string;
} 