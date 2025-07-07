import { ShopEntity } from "../entities/Shop.entity";
import { VendorEntity } from "../entities/Vendor.entity";

export interface IVendorRepository {
    createVendor(userId: number): Promise<VendorEntity>;
    findByUserId(userId: number): Promise<VendorEntity>;
    listVendors(): Promise<VendorEntity[]>;
    getVendorShops(vendorId: number): Promise<ShopEntity[]>;
} 