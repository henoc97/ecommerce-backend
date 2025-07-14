import { Injectable } from "@nestjs/common";
import { BasePaymentGatewayService } from "src/application/services/payment-gateway.service";
import { PaymentGatewayRequest, PaymentGatewayResponse } from "src/domain/entities/PaymentGateway.entity";

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
                    return_url: process.env.PAYPAL_RETURN_URL || `${process.env.CLIENT_URL}/payment/success`,
                    cancel_url: process.env.PAYPAL_CANCEL_URL || `${process.env.CLIENT_URL}/payment/cancel`,
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