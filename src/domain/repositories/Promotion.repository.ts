import { PromotionEntity } from "../entities/Promotion.entity";

export interface IPromotionRepository {
    addPromotion(data: PromotionEntity): Promise<PromotionEntity>;
    updatePromotion(id: number, data: Partial<PromotionEntity>): Promise<PromotionEntity>;
    deletePromotion(id: number): Promise<void>;
    findById(id: number): Promise<PromotionEntity>;
    listPromotions(filter?: Partial<PromotionEntity>): Promise<PromotionEntity[]>;
    getVariantPromotions(productVariantId: number): Promise<PromotionEntity[]>;
    detectAbusivePromotions(): Promise<PromotionEntity[]>;
}