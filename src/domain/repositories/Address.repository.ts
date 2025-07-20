import { AddressEntity } from "../entities/Address.entity";

export interface IAddressRepository {
    createAddress(data: AddressEntity): Promise<AddressEntity>;
    updateAddress(userId: number, data: AddressEntity): Promise<AddressEntity>;
    findByUserId(userId: number): Promise<AddressEntity>;
    findAllAddresses(userId: number): Promise<AddressEntity[]>;
    deleteAddress(userId: number): Promise<void>;
    // GDPR - Suppression par utilisateur
    deleteByUserId(userId: number): Promise<void>;
}