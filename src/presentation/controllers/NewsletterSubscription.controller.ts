import { Controller, Get, Post, Delete, Body, Query, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { NewsletterSubscriptionService } from '../../application/services/newslettersubscription.service';
import { SubscribeNewsletterDto, NewsletterSubscriptionStatusDto } from '../dtos/NewsletterSubscription.dto';

@ApiTags('newsletter-subscription')
@Controller('newsletter-subscription')
export class NewsletterSubscriptionController {
    constructor(
        @Inject(NewsletterSubscriptionService) private readonly newsletterService: NewsletterSubscriptionService) { }

    @Get('status')
    @ApiOperation({ summary: 'Vérifier le statut d’abonnement à la newsletter d’une boutique' })
    @ApiQuery({ name: 'shopId', required: true })
    @ApiQuery({ name: 'email', required: true })
    @ApiResponse({ status: 200, type: NewsletterSubscriptionStatusDto })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getStatus(@Query('shopId') shopId: number, @Query('email') email: string) {
        console.log('[NewsletterSubscriptionController] getStatus', { shopId, email });
        try {
            const subscribed = await this.newsletterService.checkSubscriptionStatus(email, Number(shopId));
            console.log('[NewsletterSubscriptionController] getStatus SUCCESS', { subscribed });
            return { subscribed };
        } catch (error) {
            console.error('[NewsletterSubscriptionController] getStatus ERROR', error);
            throw new HttpException('Erreur technique, réessayez plus tard', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    @ApiOperation({ summary: 'S’abonner à la newsletter d’une boutique' })
    @ApiBody({ type: SubscribeNewsletterDto })
    @ApiResponse({ status: 201, description: 'Abonnement confirmé' })
    @ApiResponse({ status: 409, description: 'Déjà abonné à cette boutique' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async subscribe(@Body() dto: SubscribeNewsletterDto) {
        console.log('[NewsletterSubscriptionController] subscribe', dto);
        try {
            const result = await this.newsletterService.subscribe(dto.email, dto.shopId);
            console.log('[NewsletterSubscriptionController] subscribe SUCCESS', result);
            return { message: 'Abonnement confirmé' };
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.error('[NewsletterSubscriptionController] subscribe CONFLICT', error);
                throw new HttpException('Déjà abonné à cette boutique', HttpStatus.CONFLICT);
            }
            console.error('[NewsletterSubscriptionController] subscribe ERROR', error);
            throw new HttpException('Erreur technique, réessayez plus tard', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete()
    @ApiOperation({ summary: 'Se désabonner de la newsletter d’une boutique' })
    @ApiQuery({ name: 'shopId', required: true })
    @ApiQuery({ name: 'email', required: true })
    @ApiResponse({ status: 200, description: 'Vous êtes désabonné' })
    @ApiResponse({ status: 404, description: 'Aucun abonnement à supprimer' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async unsubscribe(@Query('shopId') shopId: number, @Query('email') email: string) {
        console.log('[NewsletterSubscriptionController] unsubscribe', { shopId, email });
        try {
            await this.newsletterService.unsubscribe(email, Number(shopId));
            console.log('[NewsletterSubscriptionController] unsubscribe SUCCESS');
            return { message: 'Vous êtes désabonné' };
        } catch (error: any) {
            if (error.code === 'P2025') {
                console.error('[NewsletterSubscriptionController] unsubscribe NOT FOUND', error);
                throw new HttpException('Aucun abonnement à supprimer', HttpStatus.NOT_FOUND);
            }
            console.error('[NewsletterSubscriptionController] unsubscribe ERROR', error);
            throw new HttpException('Erreur technique, réessayez plus tard', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}