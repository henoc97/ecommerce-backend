import { Controller, Get, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from '../../application/services/analytics.service';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SELLER)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('/top-sellers')
    @ApiOperation({ summary: 'Obtenir le classement des vendeurs (top vendeurs) sur une période' })
    @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO)' })
    @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO)' })
    @ApiResponse({ status: 200, description: 'Classement des vendeurs' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getTopSellers(@Query('from') from?: string, @Query('to') to?: string) {
        console.log('[AnalyticsController] getTopSellers', { from, to });
        try {
            const result = await this.analyticsService.getTopSellers(from, to);
            console.log('[AnalyticsController] getTopSellers SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[AnalyticsController] getTopSellers ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/top-products')
    @ApiOperation({ summary: 'Obtenir le classement des produits (top produits) sur une période' })
    @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO)' })
    @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO)' })
    @ApiResponse({ status: 200, description: 'Classement des produits' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getTopProducts(@Query('from') from?: string, @Query('to') to?: string) {
        console.log('[AnalyticsController] getTopProducts', { from, to });
        try {
            const result = await this.analyticsService.getTopProducts(from, to);
            console.log('[AnalyticsController] getTopProducts SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[AnalyticsController] getTopProducts ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 