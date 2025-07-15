import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { VendorService } from '../../application/services/vendor.service';
import { ShopService } from '../../application/services/shop.service';
import { SellerDashboardDto, SellerShopsListDto, SellerShopListItemDto } from '../dtos/SellerDashboard.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../domain/enums/UserRole.enum';

@ApiTags('Vendeurs')
@ApiBearerAuth()
@Controller('sellers')
export class SellerController {
    constructor(
        private readonly vendorService: VendorService,
        private readonly shopService: ShopService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('dashboard')
    @ApiOperation({ summary: 'Liste des shops du vendeur (accès sécurisé)', description: 'Récupère la liste des shops associés à l\'utilisateur vendeur.' })
    @ApiResponse({ status: 200, description: 'Liste des shops réussie.', type: SellerShopsListDto })
    @ApiResponse({ status: 401, description: 'Non authentifié ou non vendeur.', type: HttpException })
    @ApiResponse({ status: 404, description: 'Aucun vendeur trouvé.', type: HttpException })
    @ApiResponse({ status: 500, description: 'Erreur serveur.', type: HttpException })
    async getShopsList(@Req() req: any) {
        console.log('[SellerController] getShopsList', { user: req.user });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[SellerController] getShopsList FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const vendor = await this.vendorService.findByUserId(req.user.id);
            if (!vendor) {
                console.error('[SellerController] getShopsList NOT FOUND vendor', { userId: req.user.id });
                throw new HttpException('Aucun vendeur trouvé', HttpStatus.NOT_FOUND);
            }
            const shops = await this.vendorService.getVendorShops(vendor.id);
            const shopDtos: SellerShopListItemDto[] = (shops || []).map(shop => ({
                shopId: shop.id,
                shopName: shop.name,
                shopUrl: shop.url,
                shopDescription: shop.description,
                shopCreatedAt: shop.createdAt?.toISOString?.() ?? '',
                shopUpdatedAt: shop.updatedAt?.toISOString?.() ?? '',
            }));
            const response: SellerShopsListDto = {
                vendorId: vendor.id,
                userId: vendor.userId,
                shops: shopDtos,
            };
            console.log('[SellerController] getShopsList SUCCESS', response);
            return response;
        } catch (error) {
            console.error('[SellerController] getShopsList ERROR', error);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('dashboard/:shopId')
    @ApiOperation({ summary: 'Dashboard détaillé d’un shop du vendeur (accès sécurisé)', description: 'Récupère le dashboard détaillé d\'une boutique spécifique associée à l\'utilisateur vendeur.' })
    @ApiParam({ name: 'shopId', description: 'ID de la boutique à récupérer.', type: Number })
    @ApiResponse({ status: 200, description: 'Dashboard de la boutique réussie.', type: SellerDashboardDto })
    @ApiResponse({ status: 401, description: 'Non authentifié ou non vendeur.', type: HttpException })
    @ApiResponse({ status: 404, description: 'Boutique non trouvée.', type: HttpException })
    @ApiResponse({ status: 500, description: 'Erreur serveur.', type: HttpException })
    async getShopDashboard(@Req() req: any, @Param('shopId') shopId: number) {
        console.log('[SellerController] getShopDashboard', { user: req.user, shopId });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[SellerController] getShopDashboard FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const vendor = await this.vendorService.findByUserId(req.user.id);
            if (!vendor) {
                console.error('[SellerController] getShopDashboard NOT FOUND vendor', { userId: req.user.id });
                throw new HttpException('Aucun vendeur trouvé', HttpStatus.NOT_FOUND);
            }
            const shops = await this.vendorService.getVendorShops(vendor.id);
            const shop = (shops || []).find(s => s.id === Number(shopId));
            if (!shop) {
                console.error('[SellerController] getShopDashboard NOT FOUND shop', { vendorId: vendor.id, shopId });
                throw new HttpException('Boutique non trouvée', HttpStatus.NOT_FOUND);
            }
            const response: SellerDashboardDto = {
                vendorId: vendor.id,
                userId: vendor.userId,
                shopName: shop.name,
                shopUrl: shop.url,
                shopDescription: shop.description,
                shopCreatedAt: shop.createdAt?.toISOString?.() ?? '',
                shopUpdatedAt: shop.updatedAt?.toISOString?.() ?? '',
            };
            console.log('[SellerController] getShopDashboard SUCCESS', response);
            return response;
        } catch (error) {
            console.error('[SellerController] getShopDashboard ERROR', error);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 