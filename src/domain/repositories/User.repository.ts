import { UserEntity } from "../entities/User.entity";

export interface IConsentPreferences {
    marketing: boolean;
    analytics: boolean;
    necessary: boolean;
    preferences: boolean;
    lastUpdated: Date;
}

export interface IUserRepository {
    createUser(data: UserEntity): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity>;
    findById(id: number): Promise<UserEntity>;
    updateUser(id: number, data: Partial<UserEntity>): Promise<UserEntity>;
    deleteUser(id: number): Promise<void>;
    listUsers(filter?: Partial<UserEntity>): Promise<UserEntity[]>;
    disableUser(id: number): Promise<void>;
    // Authentification
    signIn(email: string, password: string): Promise<UserEntity>;
    signInWithGoogle(googleId: string): Promise<UserEntity>;
    // Gestion des rôles
    setRole(id: number, role: string): Promise<void>;
    forceLogout(userId: number): Promise<void>;
    deleteSensitiveData(userId: number): Promise<void>;
    // GDPR - Gestion du consentement
    updateConsentPreferences(userId: number, preferences: IConsentPreferences): Promise<void>;
    getConsentPreferences(userId: number): Promise<IConsentPreferences | null>;
} 