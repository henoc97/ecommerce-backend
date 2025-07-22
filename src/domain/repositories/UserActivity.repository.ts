import { UserActivityEntity } from "../entities/UserActivity.entity";

export interface IUserActivityRepository {
    logActivity(data: UserActivityEntity): Promise<UserActivityEntity>;
    listActivities(filter?: Partial<UserActivityEntity>): Promise<UserActivityEntity[]>;
    getShopActivities(shopId: number): Promise<UserActivityEntity[]>;
    // GDPR - Recherche et suppression par utilisateur
    findByUserId(userId: number): Promise<UserActivityEntity[]>;
    deleteByUserId(userId: number): Promise<void>;
} 