import { SubsiteEntity } from "../entities/Subsite.entity";

export interface ISubsiteRepository {
    createSubsite(data: SubsiteEntity): Promise<SubsiteEntity>;
    updateSubsite(id: number, config: Partial<SubsiteEntity>): Promise<SubsiteEntity>;
    findByShopId(shopId: number): Promise<SubsiteEntity>;
    findById(id: number): Promise<SubsiteEntity>;
} 