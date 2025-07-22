import { Injectable, ForbiddenException } from '@nestjs/common';
import { PromotionPrismaRepository } from '../../infrastructure/impl.repositories/PromotionPrisma.repository';
import { PromotionEntity } from '../../domain/entities/Promotion.entity';
import { UpdatePromotionDto } from '../../presentation/dtos/Promotion.dto';

@Injectable()
export class PromotionService {
    constructor(
        private readonly repository: PromotionPrismaRepository,
    ) { }

    async createPromotion(data: PromotionEntity) {
        try {
            return await this.repository.addPromotion(data);
        } catch (error) {
            throw error;
        }
    }
    async deletePromotion(id: number) {
        try {
            return await this.repository.deletePromotion(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listPromotions(filter?: Partial<PromotionEntity>) {
        try {
            return await this.repository.listPromotions(filter);
        } catch (error) {
            throw error;
        }
    }
    async getVariantPromotions(productVariantId: number) {
        try {
            return await this.repository.getVariantPromotions(productVariantId);
        } catch (error) {
            throw error;
        }
    }
    async detectAbusivePromotions() {
        try {
            return await this.repository.detectAbusivePromotions();
        } catch (error) {
            throw error;
        }
    }

    async deletePromotionsByProduct(productId: number, userId: number): Promise<number> {
        // Vérifier ownership du produit
        const product = await this.repository.findProductWithOwnership(productId);
        if (!product) throw new ForbiddenException('Produit introuvable');
        if (product.shop.vendor.userId !== userId) throw new ForbiddenException('Accès interdit');
        // Récupérer toutes les variantes du produit
        // On suppose que le repo expose une méthode getVariantIdsByProductId
        const variantIds = product.productVariants?.map((v: any) => v.id) || [];
        if (!variantIds.length) return 0;
        // Supprimer toutes les promotions liées
        const count = await this.repository.deleteManyByProductVariantIds(variantIds);
        console.log(`User ${userId} deleted ${count} promotions for product ${productId}`);
        return count;
    }

    async deletePromotionByVariant(productVariantId: number, userId: number): Promise<boolean> {
        // Vérifier ownership de la variante
        const variant = await this.repository.findVariantWithOwnership(productVariantId);
        if (!variant) throw new ForbiddenException('Variante introuvable');
        if (variant.product.shop.vendor.userId !== userId) throw new ForbiddenException('Accès interdit');
        // Supprimer la promotion
        const count = await this.repository.deleteManyByProductVariantId(productVariantId);
        console.log(`User ${userId} deleted ${count} promotions for variant ${productVariantId}`);
        return count > 0;
    }

    async updatePromotion(id: number, dto: UpdatePromotionDto, userId: number): Promise<boolean> {
        // Vérifier existence et ownership
        const promo = await this.repository.findPromotionWithOwnership(id);
        if (!promo) return false;
        if (promo.productVariant.product.shop.vendor.userId !== userId) throw new ForbiddenException();
        // Préparer les données à mettre à jour (ne garder que les champs du modèle)
        const updateData: Partial<PromotionEntity> = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.discountValue !== undefined) updateData.discountValue = dto.discountValue;
        if (dto.discountType !== undefined) updateData.discountType = dto.discountType;
        if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
        if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
        // Ne pas passer productId/productVariantId
        await this.repository.updatePromotion(id, updateData);
        console.log(`User ${userId} updated promotion ${id}`);
        return true;
    }
} 