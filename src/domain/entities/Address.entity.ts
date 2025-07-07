import { UserEntity } from "./User.entity";

export class AddressEntity {
    id: number;
    userId: number;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    user?: UserEntity;
} 