import { Injectable, Logger } from '@nestjs/common';
import { PromotionService } from '../../services/promotion.service';
import { ProductVariantService } from '../../services/productvariant.service';
import { ProductService } from '../../services/product.service';
import { VendorService } from '../../services/vendor.service';
import { PromotionCreateDto } from '../../../presentation/dtos/Product.dto';

@Injectable()
export class CreatePromotionUseCase {
    private readonly logger = new Logger(CreatePromotionUseCase.name);
    constructor(
        private readonly promotionService: PromotionService,
        private readonly productVariantService: ProductVariantService,
        private readonly productService: ProductService,
        private readonly vendorService: VendorService,
    ) { }

    async execute(dto: PromotionCreateDto, userId: number): Promise<any> {
        const vendor = await this.vendorService.findByUserId(userId);
        if (!vendor) {
            this.logger.error('Vendeur non trouvé', { userId });
            const error = new Error('Vendeur non trouvé');
            (error as any).code = 'VENDOR_NOT_FOUND';
            throw error;
        }
        // Cas 1 : Promotion sur une variante spécifique
        if (dto.productVariantId) {
            const variant = await this.productVariantService.findById(dto.productVariantId);
            if (!variant) {
                this.logger.error('Variante introuvable');
                const error = new Error('Variante introuvable');
                (error as any).code = 'VARIANT_NOT_FOUND';
                throw error;
            }
            const product = await this.productService.findById(variant.productId);
            if (!product || product.shop?.vendorId !== vendor.id) {
                this.logger.error('Accès interdit : cette variante ne vous appartient pas', { userId, vendorId: vendor.id, shopVendorId: product.shop?.vendorId });
                const error = new Error('Accès interdit à la variante');
                (error as any).code = 'FORBIDDEN_VARIANT';
                throw error;
            }
            delete dto.productId;
            // Créer la promotion
            const promo = await this.promotionService.createPromotion({ ...dto, productVariantId: variant.id } as any);
            this.logger.log('Promotion créée sur variante', JSON.stringify(promo));
            return promo;
        }
        // Cas 2 : Promotion sur toutes les variantes d'un produit
        if (dto.productId) {
            const product = await this.productService.findById(dto.productId);
            if (!product || product.shop?.vendorId !== vendor.id) {
                this.logger.error('Accès interdit : ce produit ne vous appartient pas', { userId, vendorId: vendor.id, shopVendorId: product.shop?.vendorId });
                const error = new Error('Accès interdit au produit');
                (error as any).code = 'FORBIDDEN_PRODUCT';
                throw error;
            }
            const variants = await this.productVariantService.listVariants(product.id);
            if (!variants || variants.length === 0) {
                this.logger.error('Aucune variante trouvée pour ce produit');
                const error = new Error('Aucune variante trouvée pour ce produit');
                (error as any).code = 'NO_VARIANT_FOR_PRODUCT';
                throw error;
            }
            const results = [];
            let hasError = false;
            delete dto.productId;
            for (const variant of variants) {
                try {
                    const promo = await this.promotionService.createPromotion({ ...dto, productVariantId: variant.id } as any);
                    results.push({ variantId: variant.id, promotion: promo });
                } catch (err) {
                    hasError = true;
                    results.push({ variantId: variant.id, error: err.message });
                    this.logger.error('Erreur lors de la création de la promotion sur variante', { variantId: variant.id, error: err.message });
                }
            }
            if (hasError) {
                return { message: 'Certaines variantes n\'ont pas pu être promues', results };
            }
            return { message: 'Promotions créées sur toutes les variantes', results };
        }
        this.logger.error('Aucune cible de promotion fournie (productId ou productVariantId)');
        const error = new Error('Aucune cible de promotion fournie (productId ou productVariantId)');
        (error as any).code = 'NO_PROMO_TARGET';
        throw error;
    }
} 