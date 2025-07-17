import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards, Inject, Req, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RefundService } from '../../application/services/refund.service';
import { RefundDto, RefundResponseDto } from '../dtos/Refund.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefundEntity } from 'src/domain/entities/Refund.entity';
import { ProcessRefundUseCase, RefundResult } from 'src/application/use-cases/payment.use-case/ProcessRefund.use-case';
import { Logger } from 'winston';

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
    @Patch(':id/approve')
    @ApiParam({ name: 'id', required: true, description: 'ID du remboursement à approuver.' })
    @ApiOperation({ summary: 'Approuver et exécuter le remboursement', description: 'Permet au commerçant d\'approuver et de déclencher le remboursement réel.' })
    @ApiResponse({ status: 200, description: 'Remboursement approuvé et exécuté.' })
    async approveRefund(@Req() req: any, @Param('id') id: number): Promise<RefundResult> {
        const userId = req.user.id;
        const result = await this.processRefundUseCase.approveRefund(Number(id), userId);
        return result;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/reject')
    @ApiParam({ name: 'id', required: true, description: 'ID du remboursement à refuser.' })
    @ApiOperation({ summary: 'Refuser la demande de remboursement', description: 'Permet au commerçant de refuser la demande de remboursement.' })
    @ApiResponse({ status: 200, description: 'Remboursement refusé.' })
    async rejectRefund(@Req() req: any, @Param('id') id: number): Promise<RefundResult> {
        const userId = req.user.id;
        const result = await this.processRefundUseCase.rejectRefund(Number(id), userId);
        return result;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les remboursements', description: 'Retourne la liste des remboursements, filtrable par statut ou boutique.' })
    @ApiQuery({ name: 'status', required: false, description: 'Statut du remboursement (PENDING, APPROVED, etc.)' })
    @ApiQuery({ name: 'shopId', required: false, description: 'ID de la boutique' })
    @ApiResponse({ status: 200, description: 'Liste des remboursements' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listRefunds(@Query('status') status?: string, @Query('shopId') shopId?: string) {
        console.log(`[RefundController] listRefunds status=${status} shopId=${shopId}`);
        try {
            const filter: any = {};
            if (status) filter.status = status;
            if (shopId) filter.shopId = Number(shopId);
            const refunds = await this.refundService.listRefunds(filter);
            console.log('[RefundController] listRefunds SUCCESS', refunds);
            return refunds || [];
        } catch (e) {
            console.error('[RefundController] listRefunds ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des remboursements', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    @ApiOperation({ summary: 'Détail d\'un remboursement', description: 'Permet de récupérer les détails d\'un remboursement spécifique.' })
    @ApiParam({ name: 'id', required: true, description: 'ID du remboursement.' })
    @ApiResponse({ status: 200, description: 'Détail du remboursement récupéré avec succès.', type: RefundResponseDto })
    @ApiResponse({ status: 404, description: 'Aucun remboursement trouvé avec cet ID.' })
    async getRefundById(@Param('id') id: number): Promise<RefundEntity> {
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