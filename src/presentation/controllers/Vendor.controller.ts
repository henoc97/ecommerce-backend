import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { VendorService } from '../../application/services/vendor.service';
import { ShopService } from '../../application/services/shop.service';
import { CreateShopDto, UpdateShopDto, CreateSubsiteDto, ShopSubscriptionDto } from '../dtos/Shop.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../domain/enums/UserRole.enum';

@ApiTags('vendor')
@Controller()
export class VendorController {
    constructor(
        private readonly vendorService: VendorService,
        private readonly shopService: ShopService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/vendor')
    @ApiOperation({ summary: 'Récupérer les infos du vendeur connecté' })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Vendor non trouvé' })
    async getVendor(@Req() req: any) {
        console.log('[VendorController] getVendor', { user: req.user });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[VendorController] getVendor FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        const vendor = await this.vendorService.findByUserId(req.user.id);
        if (!vendor) {
            console.error('[VendorController] getVendor NOT FOUND', { userId: req.user.id });
            throw new HttpException('Vendor non trouvé', HttpStatus.NOT_FOUND);
        }
        console.log('[VendorController] getVendor SUCCESS', vendor);
        return vendor;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('shops')
    @ApiOperation({ summary: 'Créer une boutique' })
    @ApiBody({ type: CreateShopDto })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404, description: 'Vendor non trouvé' })
    @ApiResponse({ status: 409, description: 'URL déjà utilisée' })
    async createShop(@Req() req: any, @Body() dto: CreateShopDto) {
        console.log('[VendorController] createShop', { user: req.user, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[VendorController] createShop FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        const vendor = await this.vendorService.findByUserId(req.user.id);
        if (!vendor) {
            console.error('[VendorController] createShop NOT FOUND vendor', { userId: req.user.id });
            throw new HttpException('Vendor non trouvé', HttpStatus.NOT_FOUND);
        }
        // Vérifier unicité URL
        const existing = await this.shopService.listShops({ url: dto.url });
        if (existing && existing.length > 0) {
            console.error('[VendorController] createShop URL CONFLICT', { url: dto.url });
            throw new HttpException('URL déjà utilisée', HttpStatus.CONFLICT);
        }
        const shop = await this.shopService.createShop({ ...dto, vendorId: vendor.id } as any);
        console.log('[VendorController] createShop SUCCESS', { shopId: shop.id });
        return { shopId: shop.id };
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('shops/:id')
    @ApiOperation({ summary: 'Modifier une boutique' })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({ type: UpdateShopDto })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Boutique non trouvée' })
    @ApiResponse({ status: 409, description: 'URL déjà utilisée' })
    async updateShop(@Req() req: any, @Param('id') id: number, @Body() dto: UpdateShopDto) {
        console.log('[VendorController] updateShop', { user: req.user, id, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[VendorController] updateShop FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        const shop = await this.shopService.findById(Number(id));
        if (!shop) {
            console.error('[VendorController] updateShop NOT FOUND shop', { id });
            throw new HttpException('Boutique non trouvée', HttpStatus.NOT_FOUND);
        }
        // Vérifier ownership
        const vendor = await this.vendorService.findByUserId(req.user.id);
        if (!vendor || shop.vendorId !== vendor.id) {
            console.error('[VendorController] updateShop FORBIDDEN vendor', { userId: req.user.id, vendorId: vendor?.id, shopVendorId: shop.vendorId });
            throw new HttpException('Accès interdit', HttpStatus.UNAUTHORIZED);
        }
        // Vérifier unicité URL si modifiée
        if (dto.url && dto.url !== shop.url) {
            const existing = await this.shopService.listShops({ url: dto.url });
            if (existing && existing.length > 0) {
                console.error('[VendorController] updateShop URL CONFLICT', { url: dto.url });
                throw new HttpException('URL déjà utilisée', HttpStatus.CONFLICT);
            }
        }
        await this.shopService.updateShop(Number(id), dto);
        console.log('[VendorController] updateShop SUCCESS', { id });
        return { message: 'Boutique mise à jour' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('subsite')
    @ApiOperation({ summary: 'Créer un sous-site pour une boutique' })
    @ApiBody({ type: CreateSubsiteDto })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 500, description: 'Erreur interne' })
    async createSubsite(@Req() req: any, @Body() dto: CreateSubsiteDto) {
        console.log('[VendorController] createSubsite', { user: req.user, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[VendorController] createSubsite FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const subsite = await this.shopService.updateShopSubsite(dto.shopId, { title: dto.title, config: dto.config });
            console.log('[VendorController] createSubsite SUCCESS', { subsiteId: subsite.id });
            return { subsiteId: subsite.id };
        } catch (error) {
            console.error('[VendorController] createSubsite ERROR', error);
            throw new HttpException('Erreur interne', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('shops-subscription')
    @ApiOperation({ summary: 'Souscrire une boutique à une formule' })
    @ApiBody({ type: ShopSubscriptionDto })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404, description: 'Formule non trouvée' })
    async subscribeShop(@Req() req: any, @Body() dto: ShopSubscriptionDto) {
        console.log('[VendorController] subscribeShop', { user: req.user, dto });
        if (!req.user || req.user.role !== UserRole.SELLER) {
            console.error('[VendorController] subscribeShop FORBIDDEN', { user: req.user });
            throw new HttpException('Accès réservé aux vendeurs', HttpStatus.UNAUTHORIZED);
        }
        try {
            const result = await this.shopService.subscribeToPlan(dto.shopId, dto.subscriptionId);
            console.log('[VendorController] subscribeShop SUCCESS', { result });
            return { message: 'Abonnement activé', result };
        } catch (error) {
            console.error('[VendorController] subscribeShop ERROR', error);
            throw new HttpException('Formule non trouvée', HttpStatus.NOT_FOUND);
        }
    }
}
