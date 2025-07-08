import { Injectable, Logger } from '@nestjs/common';

export interface PaymentGatewayRequest {
    amount: number;
    currency: string;
    method: string;
    cardData?: {
        number: string;
        expMonth: number;
        expYear: number;
        cvc: string;
    };
    paypalData?: {
        paymentMethodId: string;
    };
    metadata?: any;
}

export interface PaymentGatewayResponse {
    success: boolean;
    providerId?: string;
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
    details?: any;
}

export interface PaymentGatewayService {
    processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
    refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse>;
}

@Injectable()
export abstract class BasePaymentGatewayService implements PaymentGatewayService {
    protected readonly logger = new Logger(this.constructor.name);

    abstract processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
    abstract refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse>;

    protected handleError(error: any): PaymentGatewayResponse {
        this.logger.error(`Payment gateway error: ${error.message}`, error.stack);

        return {
            success: false,
            errorCode: error.code || 'unknown_error',
            errorMessage: error.message || 'Une erreur inconnue est survenue',
            details: {
                timestamp: new Date().toISOString(),
                errorType: error.type || 'gateway_error',
                ...error
            }
        };
    }

    protected validateRequest(request: PaymentGatewayRequest): boolean {
        if (!request.amount || request.amount <= 0) {
            throw new Error('Montant invalide');
        }
        if (!request.currency) {
            throw new Error('Devise requise');
        }
        if (!request.method) {
            throw new Error('Méthode de paiement requise');
        }
        return true;
    }
}

// Implémentation Stripe avec le vrai SDK
@Injectable()
export class StripePaymentGatewayService extends BasePaymentGatewayService {
    private stripe: any;

    constructor() {
        super();
        this.initializeStripe();
    }

    private initializeStripe() {
        try {
            // Import dynamique pour éviter les erreurs si le package n'est pas installé
            const Stripe = require('stripe');
            const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

            if (!stripeSecretKey) {
                this.logger.warn('STRIPE_SECRET_KEY non configurée, utilisation du mode simulation');
                return;
            }

            this.stripe = new Stripe(stripeSecretKey, {
                apiVersion: '2023-10-16', // Version récente de l'API Stripe
            });
            this.logger.log('Stripe SDK initialisé avec succès');
        } catch (error) {
            this.logger.error('Erreur lors de l\'initialisation de Stripe:', error);
            this.stripe = null;
        }
    }

    async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
        try {
            this.validateRequest(request);

            // Si Stripe n'est pas configuré, utiliser la simulation
            if (!this.stripe) {
                return this.simulatePayment(request);
            }

            // Créer un PaymentIntent avec Stripe
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(request.amount * 100), // Stripe utilise les centimes
                currency: request.currency.toLowerCase(),
                payment_method_data: request.cardData ? {
                    type: 'card',
                    card: {
                        number: request.cardData.number,
                        exp_month: request.cardData.expMonth,
                        exp_year: request.cardData.expYear,
                        cvc: request.cardData.cvc,
                    },
                } : undefined,
                payment_method: request.paypalData?.paymentMethodId,
                confirm: true, // Confirmer immédiatement le paiement
                return_url: process.env.STRIPE_RETURN_URL || 'https://your-domain.com/payment/success',
                metadata: {
                    ...request.metadata,
                    method: request.method,
                    processedAt: new Date().toISOString(),
                },
            });

            if (paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    providerId: paymentIntent.id,
                    transactionId: paymentIntent.latest_charge,
                    details: {
                        method: 'stripe',
                        status: paymentIntent.status,
                        amount: paymentIntent.amount / 100,
                        currency: paymentIntent.currency,
                        processedAt: new Date().toISOString(),
                        paymentMethod: paymentIntent.payment_method,
                    }
                };
            } else if (paymentIntent.status === 'requires_action') {
                return {
                    success: false,
                    errorCode: 'requires_action',
                    errorMessage: 'Action supplémentaire requise (3D Secure, etc.)',
                    details: {
                        method: 'stripe',
                        status: paymentIntent.status,
                        nextAction: paymentIntent.next_action,
                        clientSecret: paymentIntent.client_secret,
                    }
                };
            } else {
                return {
                    success: false,
                    errorCode: 'payment_failed',
                    errorMessage: `Paiement échoué: ${paymentIntent.status}`,
                    details: {
                        method: 'stripe',
                        status: paymentIntent.status,
                        lastPaymentError: paymentIntent.last_payment_error,
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse> {
        try {
            if (!this.stripe) {
                return this.simulateRefund(providerId, amount);
            }

            const refundData: any = {
                payment_intent: providerId,
            };

            if (amount) {
                refundData.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundData);

            return {
                success: true,
                providerId: refund.id,
                details: {
                    method: 'stripe',
                    status: refund.status,
                    amount: refund.amount / 100,
                    currency: refund.currency,
                    processedAt: new Date().toISOString(),
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Méthodes de simulation pour les tests/développement
    private simulatePayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
        this.logger.warn('Utilisation du mode simulation Stripe');

        return new Promise((resolve) => {
            setTimeout(() => {
                const isSuccess = Math.random() > 0.2;
                if (isSuccess) {
                    resolve({
                        success: true,
                        providerId: `pi_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        transactionId: `txn_sim_${Date.now()}`,
                        details: {
                            method: 'stripe_simulation',
                            processedAt: new Date().toISOString(),
                            amount: request.amount,
                            currency: request.currency,
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        errorCode: 'card_declined',
                        errorMessage: 'Votre carte a été refusée (simulation)',
                        details: {
                            reason: 'insufficient_funds',
                            method: 'stripe_simulation',
                        }
                    });
                }
            }, 1000);
        });
    }

    private simulateRefund(providerId: string, amount?: number): Promise<PaymentGatewayResponse> {
        return Promise.resolve({
            success: true,
            providerId: `re_sim_${Date.now()}`,
            details: {
                refundedAmount: amount,
                processedAt: new Date().toISOString(),
                method: 'stripe_simulation',
            }
        });
    }
}

// Implémentation PayPal avec le vrai SDK
@Injectable()
export class PayPalPaymentGatewayService extends BasePaymentGatewayService {
    private paypalClient: any;

    constructor() {
        super();
        this.initializePayPal();
    }

    private initializePayPal() {
        try {
            // Import dynamique pour éviter les erreurs si le package n'est pas installé
            const paypal = require('@paypal/checkout-server-sdk');

            const clientId = process.env.PAYPAL_CLIENT_ID;
            const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                this.logger.warn('PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_SECRET non configurés, utilisation du mode simulation');
                return;
            }

            // Choisir l'environnement (Sandbox ou Live)
            const environment = process.env.NODE_ENV === 'production'
                ? new paypal.core.LiveEnvironment(clientId, clientSecret)
                : new paypal.core.SandboxEnvironment(clientId, clientSecret);

            this.paypalClient = new paypal.core.PayPalHttpClient(environment);
            this.logger.log('PayPal SDK initialisé avec succès');
        } catch (error) {
            this.logger.error('Erreur lors de l\'initialisation de PayPal:', error);
            this.paypalClient = null;
        }
    }

    async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
        try {
            this.validateRequest(request);

            // Si PayPal n'est pas configuré, utiliser la simulation
            if (!this.paypalClient) {
                return this.simulatePayment(request);
            }

            // Créer une commande PayPal
            const order = new (require('@paypal/checkout-server-sdk').orders.OrdersCreateRequest)();

            order.prefer("return=representation");
            order.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: request.currency.toUpperCase(),
                        value: request.amount.toString(),
                    },
                    description: request.metadata?.description || 'Paiement e-commerce',
                    custom_id: request.metadata?.orderId?.toString() || '',
                }],
                application_context: {
                    return_url: process.env.PAYPAL_RETURN_URL || 'https://your-domain.com/payment/success',
                    cancel_url: process.env.PAYPAL_CANCEL_URL || 'https://your-domain.com/payment/cancel',
                    brand_name: process.env.PAYPAL_BRAND_NAME || 'Votre Boutique',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                },
            });

            const response = await this.paypalClient.execute(order);

            if (response.result.status === 'COMPLETED') {
                return {
                    success: true,
                    providerId: response.result.id,
                    transactionId: response.result.purchase_units[0]?.payments?.captures?.[0]?.id,
                    details: {
                        method: 'paypal',
                        status: response.result.status,
                        amount: request.amount,
                        currency: request.currency,
                        processedAt: new Date().toISOString(),
                        paypalOrderId: response.result.id,
                    }
                };
            } else if (response.result.status === 'APPROVED') {
                // Capturer le paiement
                return await this.capturePayment(response.result.id);
            } else {
                return {
                    success: false,
                    errorCode: 'order_not_completed',
                    errorMessage: `Commande PayPal non complétée: ${response.result.status}`,
                    details: {
                        method: 'paypal',
                        status: response.result.status,
                        orderId: response.result.id,
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async capturePayment(orderId: string): Promise<PaymentGatewayResponse> {
        try {
            const request = new (require('@paypal/checkout-server-sdk').orders.OrdersCaptureRequest)(orderId);
            const response = await this.paypalClient.execute(request);

            if (response.result.status === 'COMPLETED') {
                return {
                    success: true,
                    providerId: response.result.id,
                    transactionId: response.result.purchase_units[0]?.payments?.captures?.[0]?.id,
                    details: {
                        method: 'paypal',
                        status: response.result.status,
                        processedAt: new Date().toISOString(),
                        paypalOrderId: response.result.id,
                    }
                };
            } else {
                return {
                    success: false,
                    errorCode: 'capture_failed',
                    errorMessage: 'Échec de la capture du paiement PayPal',
                    details: {
                        method: 'paypal',
                        status: response.result.status,
                        orderId: response.result.id,
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse> {
        try {
            if (!this.paypalClient) {
                return this.simulateRefund(providerId, amount);
            }

            const request = new (require('@paypal/checkout-server-sdk').payments.CapturesRefundRequest)(providerId);

            if (amount) {
                request.requestBody({
                    amount: {
                        value: amount.toString(),
                        currency_code: 'USD', // À adapter selon la devise
                    },
                });
            }

            const response = await this.paypalClient.execute(request);

            return {
                success: true,
                providerId: response.result.id,
                details: {
                    method: 'paypal',
                    status: response.result.status,
                    refundedAmount: amount,
                    processedAt: new Date().toISOString(),
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Méthodes de simulation pour les tests/développement
    private simulatePayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
        this.logger.warn('Utilisation du mode simulation PayPal');

        return new Promise((resolve) => {
            setTimeout(() => {
                const isSuccess = Math.random() > 0.15;
                if (isSuccess) {
                    resolve({
                        success: true,
                        providerId: `PAY-SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        transactionId: `TXN-SIM-${Date.now()}`,
                        details: {
                            method: 'paypal_simulation',
                            processedAt: new Date().toISOString(),
                            amount: request.amount,
                            currency: request.currency,
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        errorCode: 'payment_failed',
                        errorMessage: 'Le paiement PayPal a échoué (simulation)',
                        details: {
                            reason: 'insufficient_funds',
                            method: 'paypal_simulation',
                        }
                    });
                }
            }, 1200);
        });
    }

    private simulateRefund(providerId: string, amount?: number): Promise<PaymentGatewayResponse> {
        return Promise.resolve({
            success: true,
            providerId: `REF-SIM-${Date.now()}`,
            details: {
                refundedAmount: amount,
                processedAt: new Date().toISOString(),
                method: 'paypal_simulation',
            }
        });
    }
}

// Factory pour créer le bon service selon la méthode
@Injectable()
export class PaymentGatewayFactory {
    constructor(
        private readonly stripeService: StripePaymentGatewayService,
        private readonly paypalService: PayPalPaymentGatewayService,
    ) { }

    getService(method: string): PaymentGatewayService {
        switch (method.toLowerCase()) {
            case 'stripe':
                return this.stripeService;
            case 'paypal':
                return this.paypalService;
            default:
                throw new Error(`Méthode de paiement non supportée: ${method}`);
        }
    }
} 