import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from '../../application/services/review.service';
import { OrderService } from '../../application/services/order.service';
import { CreateReviewDto, ReviewResponseDto } from '../dtos/Review.dto';
import { AuthGuard } from '@nestjs/passport';
import { OrderStatus } from '../../domain/enums/OrderStatus.enum';

@ApiTags('Avis')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
    constructor(
        private readonly reviewService: ReviewService,
        private readonly orderService: OrderService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un avis produit', description: 'Permet de créer un avis pour un produit acheté par l\'utilisateur.' })
    @ApiBody({ type: CreateReviewDto })
    @ApiResponse({ status: 201, type: ReviewResponseDto, description: 'Merci pour votre avis' })
    @ApiResponse({ status: 400, description: 'Vous devez avoir acheté ce produit', type: HttpException })
    @ApiResponse({ status: 403, description: 'Vous avez déjà évalué ce produit', type: HttpException })
    @ApiResponse({ status: 409, description: 'Vous avez déjà laissé un avis', type: HttpException })
    @ApiResponse({ status: 500, description: 'Erreur serveur', type: HttpException })
    async createReview(@Body() dto: CreateReviewDto) {
        console.log('[ReviewController] createReview', dto);
        try {
            // Vérifier si déjà évalué (unicité)
            const existing = await this.reviewService.checkUserProductReview(dto.userId, dto.productVariantId);
            if (existing) {
                console.log('[ReviewController] createReview FORBIDDEN: déjà évalué');
                throw new HttpException('Vous avez déjà évalué ce produit', HttpStatus.FORBIDDEN);
            }
            // Vérifier achat (Order + OrderItem)
            const orders = await this.orderService.listOrders({ userId: dto.userId, status: { in: [OrderStatus.DELIVERED, OrderStatus.RETURNED] } } as any);
            const hasBought = orders.some(order => order.items?.some(item => item.productVariantId === dto.productVariantId));
            if (!hasBought) {
                console.log('[ReviewController] createReview BAD_REQUEST: jamais acheté');
                throw new HttpException('Vous devez avoir acheté ce produit', HttpStatus.BAD_REQUEST);
            }
            // Créer l'avis
            const review = await this.reviewService.createReview({
                ...dto,
            } as any);
            console.log('[ReviewController] createReview SUCCESS', review);
            return review;
        } catch (error: any) {
            if (error.code === 'P2002') { // Prisma unique constraint
                console.error('[ReviewController] createReview CONFLICT', error);
                throw new HttpException('Vous avez déjà laissé un avis', HttpStatus.CONFLICT);
            }
            console.error('[ReviewController] createReview ERROR', error);
            throw error instanceof HttpException ? error : new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('check')
    @ApiOperation({ summary: 'Vérifier si un utilisateur a déjà évalué un produit', description: 'Permet de vérifier si un utilisateur a déjà évalué un produit spécifique.' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID de l\'utilisateur' })
    @ApiQuery({ name: 'productVariantId', required: true, description: 'ID de la variante de produit' })
    @ApiResponse({ status: 200, description: 'OK (formulaire visible)' })
    @ApiResponse({ status: 403, description: 'Vous avez déjà évalué ce produit', type: HttpException })
    async checkReview(@Query('userId') userId: number, @Query('productVariantId') productVariantId: number) {
        console.log('[ReviewController] checkReview', { userId, productVariantId });
        try {
            const existing = await this.reviewService.checkUserProductReview(Number(userId), Number(productVariantId));
            if (existing) {
                console.log('[ReviewController] checkReview FORBIDDEN');
                throw new HttpException('Vous avez déjà évalué ce produit', HttpStatus.FORBIDDEN);
            }
            console.log('[ReviewController] checkReview OK');
            return { ok: true };
        } catch (error) {
            console.error('[ReviewController] checkReview ERROR', error);
            throw error instanceof HttpException ? error : new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:shopId')
    @ApiOperation({ summary: 'Lister les avis d\'une boutique', description: 'Permet de lister tous les avis associés à une boutique.' })
    @ApiResponse({ status: 200, type: [ReviewResponseDto], description: 'Liste des avis de la boutique' })
    @ApiResponse({ status: 404, description: 'Aucun avis trouvé pour cette boutique', type: HttpException })
    async listReviewsByShop(@Param('shopId') shopId: number) {
        console.log('[ReviewController] listReviewsByShop', { shopId });
        try {
            const reviews = await this.reviewService.getShopReviews(Number(shopId));
            if (!reviews || reviews.length === 0) {
                console.log('[ReviewController] Aucun avis trouvé pour cette boutique', { shopId });
                throw new HttpException('Aucun avis trouvé pour cette boutique', HttpStatus.NOT_FOUND);
            }
            console.log('[ReviewController] listReviewsByShop SUCCESS', reviews);
            return reviews;
        } catch (error) {
            console.error('[ReviewController] listReviewsByShop ERROR', error);
            throw error instanceof HttpException ? error : new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}