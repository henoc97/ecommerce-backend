import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RefundService } from '../../application/services/refund.service';
import { CreateRefundDto, RefundResponseDto } from '../dtos/Refund.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefundEntity } from 'src/domain/entities/Refund.entity';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundController {
    constructor(private readonly refundService: RefundService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer une demande de remboursement' })
    @ApiBody({ type: CreateRefundDto })
    @ApiResponse({ status: 201, type: RefundResponseDto })
    @ApiResponse({ status: 404, description: 'Commande introuvable' })
    @ApiResponse({ status: 400, description: 'Remboursement non possible pour cette commande' })
    @ApiResponse({ status: 500, description: 'Erreur interne' })
    async createRefund(@Body() dto: CreateRefundDto, @Query('userId') userId: number): Promise<RefundEntity> {
        try {
            return await this.refundService.createRefund(dto as RefundEntity);
        } catch (e) {
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
        try {
            return await this.refundService.getUserRefunds(userId);
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 