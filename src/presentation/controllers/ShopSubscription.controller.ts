import { Controller, Post, Body, Req, UseGuards, HttpException, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShopService } from '../../application/services/shop.service';
import { ShopSubscriptionDto } from '../dtos/Shop.dto';
import { UserRole } from '../../domain/enums/UserRole.enum';
import { ShopSubscriptionService } from 'src/application/services/shopsubscription.service';

@ApiTags('Abonnements Boutique')
@ApiBearerAuth()
@Controller('shop-subscriptions')
export class ShopSubscriptionController {
    constructor(
        private readonly shopService: ShopService,
        private readonly shopSubscriptionService: ShopSubscriptionService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Souscrire une boutique à une formule' })
    @ApiBody({ type: ShopSubscriptionDto })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404, description: 'Formule non trouvée' })
    @ApiResponse({ status: 500, description: 'Erreur interne' })
    async subscribeShop(@Req() req: any, @Body() dto: ShopSubscriptionDto) {
        console.log('[ShopSubscriptionController] subscribeShop', { user: req.user, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[ShopSubscriptionController] subscribeShop FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.shopService.subscribeToPlan(dto.shopId, dto.subscriptionId);
            console.log('[ShopSubscriptionController] subscribeShop SUCCESS', { result });
            return { message: 'Abonnement activé', result };
        } catch (error) {
            console.error('[ShopSubscriptionController] subscribeShop ERROR', error);
            throw new HttpException('Formule non trouvée', HttpStatus.NOT_FOUND);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister toutes les souscriptions de shops actives' })
    @ApiResponse({ status: 200, description: 'Liste des souscriptions' })
    async listShopSubscriptions() {
        console.log('[SubscriptionController] listShopSubscriptions');
        try {
            const subs = await this.shopSubscriptionService.getActiveSubscriptions();
            return subs || [];
        } catch (e) {
            console.error('[SubscriptionController] listShopSubscriptions ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/expired')
    @ApiOperation({ summary: 'Lister les souscriptions expirées' })
    @ApiResponse({ status: 200, description: 'Liste des souscriptions expirées' })
    async listExpiredShopSubscriptions() {
        console.log('[SubscriptionController] listExpiredShopSubscriptions');
        try {
            const expired = await this.shopSubscriptionService.getExpiredSubscriptions();
            return expired;
        } catch (e) {
            console.error('[SubscriptionController] listExpiredShopSubscriptions ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}