import { Test, TestingModule } from '@nestjs/testing';
import { GDPRService } from '../../src/application/services/gdpr.service';
import { UserService } from '../../src/application/services/user.service';
import { OrderService } from '../../src/application/services/order.service';
import { CartService } from '../../src/application/services/cart.service';
import { ReviewService } from '../../src/application/services/review.service';
import { NotificationService } from '../../src/application/services/notification.service';
import { UserActivityService } from '../../src/application/services/useractivity.service';
import { NewsletterSubscriptionService } from '../../src/application/services/newslettersubscription.service';
import { AddressService } from '../../src/application/services/address.service';
import { AuditLogService } from '../../src/application/services/auditlog.service';

describe('GDPRService', () => {
    let service: GDPRService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GDPRService,
                { provide: UserService, useValue: {} },
                { provide: OrderService, useValue: {} },
                { provide: CartService, useValue: {} },
                { provide: ReviewService, useValue: {} },
                { provide: NotificationService, useValue: {} },
                { provide: UserActivityService, useValue: {} },
                { provide: NewsletterSubscriptionService, useValue: {} },
                { provide: AddressService, useValue: {} },
                { provide: AuditLogService, useValue: {} },
            ],
        }).compile();
        service = module.get<GDPRService>(GDPRService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('GDPRService - Méthodes métiers', () => {
    let service: GDPRService;
    let userService: any;
    let orderService: any;
    let cartService: any;
    let reviewService: any;
    let notificationService: any;
    let userActivityService: any;
    let newsletterSubscriptionService: any;
    let addressService: any;
    let auditLogService: any;

    beforeEach(async () => {
        userService = { deleteUser: jest.fn(), findById: jest.fn(), updateConsentPreferences: jest.fn() };
        orderService = { anonymizeByUserId: jest.fn(), findByUserId: jest.fn() };
        cartService = { deleteByUserId: jest.fn(), findByUserId: jest.fn() };
        reviewService = { deleteByUserId: jest.fn(), findByUserId: jest.fn() };
        notificationService = { deleteByUserId: jest.fn(), findByUserId: jest.fn() };
        userActivityService = { deleteByUserId: jest.fn(), findByUserId: jest.fn() };
        newsletterSubscriptionService = { deleteByUserId: jest.fn(), findByUserId: jest.fn() };
        addressService = { deleteByUserId: jest.fn(), findAllAddresses: jest.fn() };
        auditLogService = { logAction: jest.fn(), findByUserId: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GDPRService,
                { provide: UserService, useValue: userService },
                { provide: OrderService, useValue: orderService },
                { provide: CartService, useValue: cartService },
                { provide: ReviewService, useValue: reviewService },
                { provide: NotificationService, useValue: notificationService },
                { provide: UserActivityService, useValue: userActivityService },
                { provide: NewsletterSubscriptionService, useValue: newsletterSubscriptionService },
                { provide: AddressService, useValue: addressService },
                { provide: AuditLogService, useValue: auditLogService },
            ],
        }).compile();
        service = module.get<GDPRService>(GDPRService);
    });

    it('doit orchestrer la suppression RGPD complète', async () => {
        await service.deleteUserData(1);
        expect(newsletterSubscriptionService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(userActivityService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(notificationService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(reviewService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(cartService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(addressService.deleteByUserId).toHaveBeenCalledWith(1);
        expect(orderService.anonymizeByUserId).toHaveBeenCalledWith(1);
        expect(userService.deleteUser).toHaveBeenCalledWith(1);
        expect(auditLogService.logAction).toHaveBeenCalled();
    });

    it('doit retourner une erreur si user non trouvé lors du consentement', async () => {
        userService.findById.mockResolvedValue(null);
        await expect(
            service.updateConsentPreferences(1, { marketing: false })
        ).rejects.toThrow('Erreur lors de la mise à jour des préférences de consentement');
    });

    it('doit orchestrer l\'export des données utilisateur', async () => {
        userService.findById.mockResolvedValue({ id: 1, email: 'a', name: 'b', role: 'user', createdAt: new Date(), updatedAt: new Date() });
        orderService.findByUserId.mockResolvedValue([]);
        cartService.findByUserId.mockResolvedValue([]);
        reviewService.findByUserId.mockResolvedValue([]);
        notificationService.findByUserId.mockResolvedValue([]);
        userActivityService.findByUserId.mockResolvedValue([]);
        newsletterSubscriptionService.findByUserId.mockResolvedValue([]);
        addressService.findAllAddresses.mockResolvedValue([]);
        auditLogService.findByUserId.mockResolvedValue([]);
        auditLogService.logAction.mockResolvedValue(undefined);
        const result = await service.exportUserData(1);
        expect(result.user.id).toBe(1);
        expect(auditLogService.logAction).toHaveBeenCalled();
    });
}); 