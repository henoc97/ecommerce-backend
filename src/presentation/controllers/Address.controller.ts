import { Body, Controller, HttpException, HttpStatus, Post, UseGuards, Put, Param, Delete } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { AddressService } from "src/application/services/address.service";
import { UserService } from "src/application/services/user.service";

@Controller('adresses')
export class AddressController {
    constructor(
        private readonly addressService: AddressService,
        private readonly userService: UserService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Ajouter une adresse à un utilisateur' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number', example: 1 },
                street: { type: 'string', example: '12 rue de Paris' },
                city: { type: 'string', example: 'Paris' },
                state: { type: 'string', example: 'Ile-de-France' },
                postalCode: { type: 'string', example: '75001' },
                country: { type: 'string', example: 'France' }
            },
            required: ['userId', 'street', 'city', 'state', 'postalCode', 'country']
        }
    })
    @ApiResponse({ status: 201, description: 'Adresse ajoutée' })
    @ApiResponse({ status: 400, description: 'Champs manquants' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    @ApiResponse({ status: 409, description: 'Cet utilisateur a déjà une adresse' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async addAddress(@Body() body: any) {
        console.log('[AddressController] addAddress', body);
        try {
            if (!body.userId || !body.street || !body.city || !body.state || !body.postalCode || !body.country) {
                throw new HttpException('Champs manquants', HttpStatus.BAD_REQUEST);
            }
            // Vérifier que l'utilisateur existe
            const user = await this.userService.findById(body.userId);
            if (!user) {
                throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
            }
            // Ajout de l'adresse (unicité gérée par le service/repository)
            const address = await this.addressService.createAddress(body);
            console.log('[AddressController] addAddress SUCCESS', address);
            return { addressId: address.id };
        } catch (e: any) {
            if (e.code === 'P2002' || e.message?.includes('unique')) {
                throw new HttpException('Cet utilisateur a déjà une adresse', HttpStatus.CONFLICT);
            }
            console.error('[AddressController] addAddress ERROR', e);
            throw new HttpException('Erreur serveur lors de l\'ajout de l\'adresse', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Modifier une adresse' })
    @ApiParam({ name: 'id', required: true, description: 'ID de l\'adresse' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                street: { type: 'string', example: '12 rue de Paris' },
                city: { type: 'string', example: 'Paris' },
                state: { type: 'string', example: 'Ile-de-France' },
                postalCode: { type: 'string', example: '75001' },
                country: { type: 'string', example: 'France' }
            },
            required: ['street', 'city', 'state', 'postalCode', 'country']
        }
    })
    @ApiResponse({ status: 200, description: 'Adresse modifiée' })
    @ApiResponse({ status: 404, description: 'Adresse non trouvée' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updateAddress(@Param('id') id: number, @Body() body: any) {
        console.log('[AddressController] updateAddress', { id, body });
        try {
            const updated = await this.addressService.updateAddress(id, body);
            if (!updated) {
                throw new HttpException('Adresse non trouvée', HttpStatus.NOT_FOUND);
            }
            console.log('[AddressController] updateAddress SUCCESS', updated);
            return updated;
        } catch (e) {
            console.error('[AddressController] updateAddress ERROR', e);
            throw new HttpException('Erreur serveur lors de la modification de l\'adresse', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':userId')
    @ApiOperation({ summary: 'Supprimer une adresse' })
    @ApiParam({ name: 'id', required: true, description: 'ID de l\'adresse' })
    @ApiResponse({ status: 200, description: 'Adresse supprimée' })
    @ApiResponse({ status: 404, description: 'Adresse non trouvée' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteAddress(@Param('userId') userId: number) {
        console.log('[AddressController] deleteAddress', { userId });
        try {
            await this.addressService.deleteAddress(userId);
            console.log('[AddressController] deleteAddress SUCCESS', userId);
            return { success: true };
        } catch (e) {
            console.error('[AddressController] deleteAddress ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur serveur lors de la suppression de l\'adresse', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}