import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ReviewService } from '../../application/services/review.service';
import { OrderService } from '../../application/services/order.service';
import { CreateReviewDto, ReviewResponseDto } from '../dtos/Review.dto';
import { AuthGuard } from '@nestjs/passport';
import { OrderStatus } from '../../domain/enums/OrderStatus.enum';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
    constructor(
        private readonly reviewService: ReviewService,
        private readonly orderService: OrderService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un avis produit' })
    @ApiBody({ type: CreateReviewDto })
    @ApiResponse({ status: 201, type: ReviewResponseDto, description: 'Merci pour votre avis' })
    @ApiResponse({ status: 400, description: 'Vous devez avoir acheté ce produit' })
    @ApiResponse({ status: 403, description: 'Vous avez déjà évalué ce produit' })
    @ApiResponse({ status: 409, description: 'Vous avez déjà laissé un avis' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
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
    @ApiOperation({ summary: 'Vérifier si un utilisateur a déjà évalué un produit' })
    @ApiQuery({ name: 'userId', required: true })
    @ApiQuery({ name: 'productVariantId', required: true })
    @ApiResponse({ status: 200, description: 'OK (formulaire visible)' })
    @ApiResponse({ status: 403, description: 'Vous avez déjà évalué ce produit' })
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
} 