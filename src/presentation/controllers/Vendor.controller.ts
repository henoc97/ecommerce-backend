import { Controller, Get, Req, UseGuards, HttpException, HttpStatus, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VendorService } from '../../application/services/vendor.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../domain/enums/UserRole.enum';
import { UserService } from '../../application/services/user.service';

@ApiTags('Gestion Commerçants & Shops')
@Controller('vendors')
export class VendorController {
    constructor(
        private readonly vendorService: VendorService,
        private readonly userService: UserService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les vendeurs avec leurs utilisateurs et shops' })
    @ApiResponse({ status: 200, description: 'Liste des vendeurs et shops' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listVendors() {
        console.log('[VendorController] listVendors');
        try {
            const vendors = await this.vendorService.listVendors();
            const result = [];
            for (const vendor of vendors) {
                const user = await this.userService.findById(vendor.userId);
                const shops = await this.vendorService.getVendorShops(vendor.id);
                result.push({
                    id: vendor.id,
                    user,
                    userId: vendor.userId,
                    shops
                });
            }
            console.log('[VendorController] listVendors SUCCESS', result);
            return result;
        } catch (e) {
            console.error('[VendorController] listVendors ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des vendeurs', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
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
    @Post('')
    @HttpCode(201)
    @ApiOperation({ summary: 'Créer un vendeur pour l\'utilisateur connecté' })
    @ApiResponse({ status: 201, description: 'Vendeur créé' })
    @ApiResponse({ status: 400, description: 'Déjà vendeur' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async createVendor(@Req() req: any) {
        console.log('[VendorController] createVendor', { user: req.user });
        if (!req.user) {
            throw new HttpException('Non authentifié', HttpStatus.UNAUTHORIZED);
        }
        // Vérifier si l'utilisateur est déjà vendeur
        const existingVendor = await this.vendorService.findByUserId(req.user.id);
        if (existingVendor) {
            throw new HttpException('Vous êtes déjà vendeur', HttpStatus.BAD_REQUEST);
        }
        // Créer le vendeur
        const vendor = await this.vendorService.createVendor(req.user.id);
        // Mettre à jour le rôle utilisateur
        await this.userService.setRole(req.user.id, UserRole.SELLER);
        console.log('[VendorController] createVendor SUCCESS', vendor);
        return { message: 'Vendeur créé', vendor };
    }
}
