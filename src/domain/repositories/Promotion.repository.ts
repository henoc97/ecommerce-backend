import { PromotionEntity } from "../entities/Promotion.entity";

export interface IPromotionRepository {
    addPromotion(data: PromotionEntity): Promise<PromotionEntity>;
    updatePromotion(id: number, data: Partial<PromotionEntity>): Promise<PromotionEntity>;
    deletePromotion(id: number): Promise<void>;
    findById(id: number): Promise<PromotionEntity>;
    listPromotions(filter?: Partial<PromotionEntity>): Promise<PromotionEntity[]>;
    getVariantPromotions(productVariantId: number): Promise<PromotionEntity[]>;
    detectAbusivePromotions(): Promise<PromotionEntity[]>;
    // Ajouts pour la gestion avancée
    deleteManyByProductVariantIds(variantIds: number[]): Promise<number>;
    deleteManyByProductVariantId(variantId: number): Promise<number>;
    findPromotionWithOwnership(promotionId: number): Promise<any>;
    findProductWithOwnership(productId: number): Promise<any>;
    findVariantWithOwnership(variantId: number): Promise<any>;
}