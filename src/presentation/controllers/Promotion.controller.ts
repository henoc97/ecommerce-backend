import { Controller, Post, Body, HttpException, HttpStatus, Logger, UseGuards, Req, Put, Param, Delete, Get, Query } from '@nestjs/common';
import { PromotionService } from '../../application/services/promotion.service';
import { PromotionCreateDto, PromotionResponseDto } from '../dtos/Product.dto';
import { ApiTags, ApiResponse, ApiBody, ApiOperation, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../domain/enums/UserRole.enum';
import { DeletePromotionDto, UpdatePromotionDto } from '../dtos/Promotion.dto';
import { CreatePromotionUseCase } from '../../application/use-cases/promotion.use-case/CreatePromotion.use-case';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('/promotions')
export class PromotionController {
    private readonly logger = new Logger(PromotionController.name);

    constructor(
        private readonly promotionService: PromotionService,
        private readonly createPromotionUseCase: CreatePromotionUseCase,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer une promotion', description: 'Crée une promotion sur une variante de produit.' })
    @ApiBody({ type: PromotionCreateDto, description: 'Payload de création de promotion' })
    @ApiResponse({ status: 201, description: 'Promotion créée', type: PromotionResponseDto })
    @ApiResponse({ status: 401, description: 'Accès réservé aux vendeurs' })
    @ApiResponse({ status: 400, description: 'Erreur de validation' })
    @ApiResponse({ status: 404, description: 'Produit/variante introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async createPromotion(
        @Body() dto: PromotionCreateDto,
        @Req() req: any
    ) {
        try {
            if (!req.user || req.user.role !== UserRole.SELLER) {
                this.logger.error('Accès réservé aux vendeurs');
                throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
            }
            const result = await this.createPromotionUseCase.execute(dto, req.user.id);
            return result;
        } catch (e) {
            switch (e.code) {
                case 'VENDOR_NOT_FOUND':
                    throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
                case 'VARIANT_NOT_FOUND':
                    throw new HttpException(e.message, HttpStatus.NOT_FOUND);
                case 'FORBIDDEN_VARIANT':
                case 'FORBIDDEN_PRODUCT':
                    throw new HttpException('Accès interdit', HttpStatus.FORBIDDEN);
                case 'NO_VARIANT_FOR_PRODUCT':
                case 'NO_PROMO_TARGET':
                    throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
                default:
                    this.logger.error(`Erreur création promotion: ${e.message}`);
                    throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Get()
    @ApiOperation({ summary: 'Lister les promotions', description: 'Retourne la liste des promotions. Si active=true, ne retourne que les promotions actives.' })
    @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'true pour ne retourner que les promotions actives' })
    @ApiResponse({ status: 200, description: 'Liste des promotions', type: [PromotionResponseDto] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listPromotions(@Query('active') active?: string) {
        this.logger.log(`GET /promotions?active=${active}`);
        try {
            let filter: any = {};
            if (active === 'true') {
                filter.endDate = { gt: new Date() };
            }
            const promotions = await this.promotionService.listPromotions(filter);
            this.logger.log('Promotions récupérées avec succès');
            return promotions;
        } catch (error) {
            this.logger.error('Erreur lors du chargement des promotions', error.stack);
            throw new HttpException(error.message || 'Erreur serveur', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete()
    @ApiOperation({ summary: 'Supprimer une promotion', description: 'Supprime une promotion sur un produit ou une variante.' })
    @ApiBody({ type: DeletePromotionDto, description: 'Payload de suppression' })
    @ApiResponse({ status: 200, description: 'Promotion supprimée' })
    @ApiResponse({ status: 404, description: 'Aucune promotion trouvée' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deletePromotion(
        @Body() dto: DeletePromotionDto,
        @Req() req: any
    ) {
        const userId = (req.user as any)?.id;
        if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        try {
            if (dto.productId) {
                // Supprimer toutes les promos du produit
                const result = await this.promotionService.deletePromotionsByProduct(dto.productId, userId);
                if (result === 0) throw new HttpException('Aucune promotion trouvée pour ce produit', HttpStatus.NOT_FOUND);
                this.logger.log(`User ${userId} deleted all promotions for product ${dto.productId}`);
                return { message: 'Promotions supprimées pour tout le produit' };
            } else if (dto.productVariantId) {
                // Supprimer la promo d'une variante
                const deleted = await this.promotionService.deletePromotionByVariant(dto.productVariantId, userId);
                if (!deleted) throw new HttpException('Aucune promotion trouvée pour cette variante', HttpStatus.NOT_FOUND);
                this.logger.log(`User ${userId} deleted promotion for variant ${dto.productVariantId}`);
                return { message: 'Promotion supprimée pour la variante' };
            } else {
                throw new HttpException('productId ou productVariantId requis', HttpStatus.BAD_REQUEST);
            }
        } catch (e) {
            if (e instanceof HttpException) throw e;
            this.logger.error(`Erreur suppression promotion: ${e.message}`);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/promotion/:id')
    @ApiOperation({ summary: 'Mettre à jour une promotion', description: 'Modifie une promotion existante.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la promotion à modifier' })
    @ApiBody({ type: UpdatePromotionDto, description: 'Payload de mise à jour' })
    @ApiResponse({ status: 200, description: 'Promotion mise à jour' })
    @ApiResponse({ status: 404, description: 'Promotion non trouvée' })
    @ApiResponse({ status: 403, description: 'Vous ne pouvez pas modifier cette promotion' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updatePromotion(
        @Param('id') id: number,
        @Body() dto: UpdatePromotionDto,
        @Req() req: any
    ) {
        const userId = (req.user as any)?.id;
        if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        try {
            const updated = await this.promotionService.updatePromotion(+id, dto, userId);
            if (!updated) throw new HttpException('Cette promotion n\'existe plus', HttpStatus.NOT_FOUND);
            this.logger.log(`User ${userId} updated promotion ${id}`);
            return { message: 'Promotion mise à jour' };
        } catch (e) {
            if (e.status === HttpStatus.FORBIDDEN) throw new HttpException('Vous ne pouvez pas modifier cette promotion', HttpStatus.FORBIDDEN);
            if (e instanceof HttpException) throw e;
            this.logger.error(`Erreur update promotion: ${e.message}`);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 