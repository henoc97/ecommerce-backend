import { Controller, Post, Body, Req, UseGuards, HttpException, HttpStatus, Get, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubsiteService } from '../../application/services/subsite.service';
import { CreateSubsiteDto } from '../dtos/Shop.dto';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Sous-sites')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SELLER, UserRole.ADMIN)
@Controller('subsites')
export class SubsiteController {
    constructor(private readonly subsiteService: SubsiteService) { }

    @Post()
    @ApiOperation({ summary: 'Créer un sous-site pour une boutique' })
    @ApiBody({ type: CreateSubsiteDto })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 500, description: 'Erreur interne' })
    async createSubsite(@Req() req: any, @Body() dto: CreateSubsiteDto) {
        console.log('[SubsiteController] createSubsite', { user: req.user, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[SubsiteController] createSubsite FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const subsite = await this.subsiteService.createSubsite({
                shopId: dto.shopId,
                title: dto.title,
                config: dto.config
            } as any);
            console.log('[SubsiteController] createSubsite SUCCESS', { subsiteId: subsite.id });
            return { subsiteId: subsite.id };
        } catch (error) {
            console.error('[SubsiteController] createSubsite ERROR', error);
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':shopId')
    @ApiOperation({ summary: 'Récupérer la config du sous-site d\'un shop' })
    @ApiParam({ name: 'shopId', required: true })
    @ApiResponse({ status: 200, description: 'Config du sous-site' })
    @ApiResponse({ status: 404, description: 'Sous-site non trouvé' })
    async getShopSubsite(@Param('shopId') shopId: number) {
        console.log('[SubsiteController] getShopSubsite', { shopId });
        const subsite = await this.subsiteService.findByShopId(Number(shopId));
        if (!subsite) {
            throw new HttpException('Sous-site non trouvé', HttpStatus.NOT_FOUND);
        }
        console.log('[SubsiteController] getShopSubsite SUCCESS', subsite);
        return subsite;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour la config JSON du sous-site' })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Mon sous-site' },
                config: { type: 'object', example: { theme: 'dark', layout: 'modern' } }
            },
            required: ['config']
        }
    })
    @ApiResponse({ status: 200, description: 'Sous-site mis à jour' })
    @ApiResponse({ status: 400, description: 'Format JSON invalide' })
    @ApiResponse({ status: 404, description: 'Sous-site non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updateSubsite(@Param('id') id: number, @Body() body: any) {
        console.log('[SubsiteController] updateSubsite', { id, body });
        if (!body.config || typeof body.config !== 'object') {
            throw new HttpException('Format JSON invalide', HttpStatus.BAD_REQUEST);
        }
        try {
            const updated = await this.subsiteService.updateSubsite(Number(id), body);
            if (!updated) {
                throw new HttpException('Sous-site non trouvé', HttpStatus.NOT_FOUND);
            }
            console.log('[SubsiteController] updateSubsite SUCCESS', updated);
            return updated;
        } catch (e) {
            console.error('[SubsiteController] updateSubsite ERROR', e);
            throw new HttpException('Erreur serveur lors de la mise à jour du sous-site', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 