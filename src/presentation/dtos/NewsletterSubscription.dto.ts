import { ApiProperty } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
    @ApiProperty({ example: 'user@email.com', description: 'Email de l’utilisateur' })
    email: string;

    @ApiProperty({ example: 1, description: 'ID de la boutique' })
    shopId: number;
}

export class NewsletterSubscriptionStatusDto {
    @ApiProperty({ example: true, description: 'Statut d’abonnement' })
    subscribed: boolean;
} 