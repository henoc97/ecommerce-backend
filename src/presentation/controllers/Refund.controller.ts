import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards, Inject, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RefundService } from '../../application/services/refund.service';
import { RefundDto, RefundResponseDto } from '../dtos/Refund.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefundEntity } from 'src/domain/entities/Refund.entity';
import { ProcessRefundUseCase, RefundResult } from 'src/application/use-cases/payment.use-case/ProcessRefund.use-case';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundController {
    constructor(
        @Inject(RefundService) private readonly refundService: RefundService,
        @Inject(ProcessRefundUseCase) private readonly processRefundUseCase: ProcessRefundUseCase
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer une demande de remboursement' })
    @ApiBody({ type: RefundDto })
    @ApiResponse({ status: 201, type: RefundResponseDto })
    @ApiResponse({ status: 404, description: 'Commande introuvable' })
    @ApiResponse({ status: 400, description: 'Remboursement non possible pour cette commande' })
    @ApiResponse({ status: 500, description: 'Erreur interne' })
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
    @ApiOperation({ summary: 'Lister les remboursements d\'un utilisateur' })
    @ApiQuery({ name: 'userId', required: true })
    @ApiResponse({ status: 200, type: [RefundResponseDto] })
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
} 