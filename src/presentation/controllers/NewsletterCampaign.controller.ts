import { Controller, Get, Post, Query, Body, Req, ForbiddenException, NotFoundException, BadGatewayException, UseGuards } from '@nestjs/common';
import { NewsletterSubscriptionService } from '../../application/services/newslettersubscription.service';
import { ShopService } from '../../application/services/shop.service';
import { EmailService } from '../../application/services/email.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';
// EmailService à créer ou à mocker
import { ConsentGuard } from '../../application/helper/consent.guard';
import { RequiresConsent } from '../../application/helper/requires-consent.decorator';

@ApiTags('Campagnes Newsletter')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, ConsentGuard)
@Roles(UserRole.SELLER, UserRole.ADMIN)
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
    @Get('/subscribers')
    async getSubscribers(@Query('shopId') shopId: number, @Req() req: any) {
        const userId = req.user?.id;
        const shop = await this.shopService.findById(Number(shopId));
        if (!shop || !shop.vendor || shop.vendor.userId !== userId) {
            throw new ForbiddenException('Accès interdit à ce shop');
        }
        const subscribers = await this.newsletterSubscriptionService.listActiveSubscribers(Number(shopId));
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
    @ApiResponse({ status: 502, description: 'Échec d\'envoi de mails.' })
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
    @RequiresConsent('marketing')
    @Post('/send')
    async sendNewsletter(@Body() body: any, @Req() req: any) {
        const { shopId, subject, content, type } = body;
        const userId = req.user?.id;
        const shop = await this.shopService.findById(Number(shopId));
        if (!shop || shop.vendor.userId !== userId) {
            throw new ForbiddenException('Accès interdit à ce shop');
        }
        const subscribers = await this.newsletterSubscriptionService.listActiveSubscribers(Number(shopId));
        if (!subscribers || subscribers.length === 0) {
            throw new NotFoundException('Aucun abonné actif à la newsletter');
        }
        try {
            await this.emailService.sendBulk(subscribers.map(s => s.email), subject, content, type);
            return { success: true, count: subscribers.length };
        } catch (e) {
            throw new BadGatewayException('Échec d\'envoi de mails');
        }
    }
} 