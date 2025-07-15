import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards, Inject, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RefundService } from '../../application/services/refund.service';
import { RefundDto, RefundResponseDto } from '../dtos/Refund.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefundEntity } from 'src/domain/entities/Refund.entity';
import { ProcessRefundUseCase, RefundResult } from 'src/application/use-cases/payment.use-case/ProcessRefund.use-case';

@ApiTags('Remboursements')
@ApiBearerAuth()
@Controller('refunds')
export class RefundController {
    constructor(
        @Inject(RefundService) private readonly refundService: RefundService,
        @Inject(ProcessRefundUseCase) private readonly processRefundUseCase: ProcessRefundUseCase
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer une demande de remboursement', description: 'Permet de créer une demande de remboursement pour une commande.' })
    @ApiBody({ type: RefundDto })
    @ApiResponse({ status: 201, description: 'Demande de remboursement créée avec succès.', type: RefundResponseDto })
    @ApiResponse({ status: 404, description: 'Commande introuvable.' })
    @ApiResponse({ status: 400, description: 'Remboursement non possible pour cette commande.' })
    @ApiResponse({ status: 500, description: 'Erreur interne.' })
    async createRefund(@Req() req: any, @Body() dto: RefundDto, @Query('userId') userId: number): Promise<RefundResult> {
        console.log('[RefundController] createRefund', { userId, dto });
        try {
            const userId = req.user.id;
            const result = await this.processRefundUseCase.execute(userId, dto);
            console.log('[RefundController] createRefund SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[RefundController] createRefund ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les remboursements d\'un utilisateur', description: 'Permet de lister les remboursements d\'un utilisateur spécifique.' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID de l\'utilisateur.' })
    @ApiResponse({ status: 200, description: 'Liste des remboursements récupérée avec succès.', type: [RefundResponseDto] })
    async listRefunds(@Query('userId') userId: number): Promise<RefundEntity[]> {
        console.log('[RefundController] listRefunds', { userId });
        try {
            const result = await this.refundService.getUserRefunds(userId);
            console.log('[RefundController] listRefunds SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[RefundController] listRefunds ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':shopId')
    @ApiOperation({ summary: 'Lister les remboursements d\'une boutique', description: 'Permet de lister les remboursements d\'une boutique spécifique.' })
    @ApiQuery({ name: 'shopId', required: true, description: 'ID de la boutique.' })
    @ApiResponse({ status: 200, description: 'Liste des remboursements récupérée avec succès.', type: [RefundResponseDto] })
    @ApiResponse({ status: 404, description: 'Aucun remboursement trouvé pour cette boutique.' })
    async listShopRefunds(@Query('shopId') shopId: number): Promise<RefundEntity[]> {
        console.log('[RefundController] listShopRefunds', { shopId });
        try {
            const result = await this.refundService.getShopRefunds(shopId);
            if (!result || result.length === 0) {
                console.log('[RefundController] Aucun remboursement trouvé pour cette boutique', { shopId });
                throw new HttpException('Aucun remboursement trouvé pour cette boutique', HttpStatus.NOT_FOUND);
            }
            console.log('[RefundController] listShopRefunds SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[RefundController] listShopRefunds ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    @ApiOperation({ summary: 'Détail d\'un remboursement', description: 'Permet de récupérer les détails d\'un remboursement spécifique.' })
    @ApiQuery({ name: 'id', required: true, description: 'ID du remboursement.' })
    @ApiResponse({ status: 200, description: 'Détail du remboursement récupéré avec succès.', type: RefundResponseDto })
    @ApiResponse({ status: 404, description: 'Aucun remboursement trouvé avec cet ID.' })
    async getRefundById(@Query('id') id: number): Promise<RefundEntity> {
        console.log('[RefundController] getRefundById', { id });
        try {
            const refund = await this.refundService.findById(id);
            if (!refund) {
                console.log('[RefundController] Aucun remboursement trouvé avec cet ID', { id });
                throw new HttpException('Aucun remboursement trouvé avec cet ID', HttpStatus.NOT_FOUND);
            }
            console.log('[RefundController] getRefundById SUCCESS', refund);
            return refund;
        } catch (e) {
            console.error('[RefundController] getRefundById ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 