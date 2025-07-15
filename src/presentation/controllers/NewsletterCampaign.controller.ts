import { Controller, Get, Post, Query, Body, Req, ForbiddenException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { NewsletterSubscriptionService } from '../../application/services/newslettersubscription.service';
import { ShopService } from '../../application/services/shop.service';
import { EmailService } from '../../application/services/email.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
// EmailService à créer ou à mocker

@ApiTags('Campagnes Newsletter')
@ApiBearerAuth()
@Controller('newsletter-campaigns')
export class NewsletterCampaignController {
    constructor(
        private readonly newsletterSubscriptionService: NewsletterSubscriptionService,
        private readonly shopService: ShopService,
        private readonly emailService: EmailService,
    ) { }

    // GET /newsletter-subscribers?shopId=...
    @ApiOperation({ summary: 'Récupérer les abonnés d\'une newsletter pour un shop' })
    @ApiResponse({ status: 200, description: 'Liste des abonnés actifs pour le shop.' })
    @ApiResponse({ status: 403, description: 'Accès interdit au shop.' })
    @ApiResponse({ status: 404, description: 'Aucun abonné trouvé.' })
    @ApiQuery({ name: 'shopId', type: Number, description: 'ID du shop.' })
    @Get('/newsletter-subscribers')
    async getSubscribers(@Query('shopId') shopId: number, @Req() req) {
        const userId = req.user?.id;
        const shop = await this.shopService.findById(shopId);
        if (!shop || shop.vendor.userId !== userId) {
            throw new ForbiddenException('Accès interdit à ce shop');
        }
        const subscribers = await this.newsletterSubscriptionService.listActiveSubscribers(shopId);
        if (!subscribers || subscribers.length === 0) {
            throw new NotFoundException('Aucun abonné à la newsletter');
        }
        return subscribers;
    }

    // POST /send-newsletter
    @ApiOperation({ summary: 'Envoyer une newsletter à tous les abonnés d\'un shop' })
    @ApiResponse({ status: 200, description: 'Newsletter envoyée avec succès.' })
    @ApiResponse({ status: 403, description: 'Accès interdit au shop.' })
    @ApiResponse({ status: 404, description: 'Aucun abonné actif trouvé.' })
    @ApiResponse({ status: 502, description: 'Échec d’envoi de mails.' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['shopId', 'subject', 'content', 'type'],
            properties: {
                shopId: { type: 'number', description: 'ID du shop.' },
                subject: { type: 'string', description: 'Sujet de la newsletter.' },
                content: { type: 'string', description: 'Contenu de la newsletter.' },
                type: { type: 'string', enum: ['text', 'html'], description: 'Type de contenu (text ou html).' },
            },
        },
    })
    @Post('/send-newsletter')
    async sendNewsletter(@Body() body, @Req() req) {
        const { shopId, subject, content, type } = body;
        const userId = req.user?.id;
        const shop = await this.shopService.findById(shopId);
        if (!shop || shop.vendor.userId !== userId) {
            throw new ForbiddenException('Accès interdit à ce shop');
        }
        const subscribers = await this.newsletterSubscriptionService.listActiveSubscribers(shopId);
        if (!subscribers || subscribers.length === 0) {
            throw new NotFoundException('Aucun abonné actif à la newsletter');
        }
        try {
            await this.emailService.sendBulk(subscribers.map(s => s.email), subject, content, type);
            return { success: true, count: subscribers.length };
        } catch (e) {
            throw new BadGatewayException('Échec d’envoi de mails');
        }
    }
} 