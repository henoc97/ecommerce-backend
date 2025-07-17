import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionService } from '../../application/services/subscription.service';
import { ShopSubscriptionService } from '../../application/services/shopsubscription.service';

@ApiTags('Abonnements')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly shopSubscriptionService: ShopSubscriptionService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister tous les plans d\'abonnement' })
    @ApiResponse({ status: 200, description: 'Liste des plans' })
    async listSubscriptions() {
        console.log('[SubscriptionController] listSubscriptions');
        try {
            const subs = await this.subscriptionService.listSubscriptions();
            return subs || [];
        } catch (e) {
            console.error('[SubscriptionController] listSubscriptions ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un plan d\'abonnement' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Premium' },
                description: { type: 'string', example: 'Accès à toutes les fonctionnalités' },
                price: { type: 'number', example: 99.99 },
                currency: { type: 'string', example: 'EUR' },
                duration: { type: 'number', example: 30 }
            },
            required: ['name', 'price', 'currency', 'duration']
        }
    })
    @ApiResponse({ status: 201, description: 'Plan créé' })
    @ApiResponse({ status: 400, description: 'Champs manquants' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async createSubscription(@Body() body: any) {
        console.log('[SubscriptionController] createSubscription', body);
        if (!body.name || !body.price || !body.currency || !body.duration) {
            throw new HttpException('Champs manquants', HttpStatus.BAD_REQUEST);
        }
        try {
            const created = await this.subscriptionService.createSubscription(body);
            return { id: created.id };
        } catch (e) {
            console.error('[SubscriptionController] createSubscription ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Modifier un plan d\'abonnement' })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Premium' },
                description: { type: 'string', example: 'Accès à toutes les fonctionnalités' },
                price: { type: 'number', example: 99.99 },
                currency: { type: 'string', example: 'EUR' },
                duration: { type: 'number', example: 30 }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Plan mis à jour' })
    @ApiResponse({ status: 404, description: 'Plan non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updateSubscription(@Param('id') id: number, @Body() body: any) {
        console.log('[SubscriptionController] updateSubscription', { id, body });
        try {
            const updated = await this.subscriptionService.updateSubscription(Number(id), body);
            if (!updated) {
                throw new HttpException('Plan non trouvé', HttpStatus.NOT_FOUND);
            }
            return updated;
        } catch (e) {
            console.error('[SubscriptionController] updateSubscription ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un plan d\'abonnement' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200, description: 'Plan supprimé' })
    @ApiResponse({ status: 404, description: 'Plan non trouvé' })
    @ApiResponse({ status: 409, description: 'Plan utilisé, suppression impossible' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteSubscription(@Param('id') id: number) {
        console.log('[SubscriptionController] deleteSubscription', { id });
        try {
            // Vérifier s'il y a des shops liés
            const actives = await this.shopSubscriptionService.getActiveSubscriptions();
            if (actives && actives.some(s => s.subscriptionId === Number(id))) {
                throw new HttpException('Plan utilisé, suppression impossible', HttpStatus.CONFLICT);
            }
            await this.subscriptionService.deleteSubscription(Number(id));
            return { success: true };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            console.error('[SubscriptionController] deleteSubscription ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


} 