import { Injectable } from "@nestjs/common";
import { BasePaymentGatewayService } from "src/application/services/payment-gateway.service";
import { PaymentGatewayRequest, PaymentGatewayResponse } from "src/domain/entities/PaymentGateway.entity";

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

            // Utiliser un token Stripe de test si fourni (ex: tok_visa)
            if (request.cardData && request.cardData.token) {
                const paymentIntent = await this.stripe.paymentIntents.create({
                    amount: Math.round(request.amount * 100),
                    currency: request.currency.toLowerCase(),
                    payment_method_data: {
                        type: 'card',
                        card: { token: request.cardData.token }
                    },
                    confirm: true,
                    return_url: process.env.STRIPE_RETURN_URL || `${process.env.CLIENT_URL}/payment/success`,
                    metadata: {
                        ...request.metadata,
                        method: request.method,
                        processedAt: new Date().toISOString(),
                    },
                });
                return this.handleStripeIntentResult(paymentIntent);
            }

            // Sinon, fallback sur les données carte classiques (pour dev uniquement)
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(request.amount * 100),
                currency: request.currency.toLowerCase(),
                payment_method_data: request.cardData ? {
                    type: 'card',
                    card: {
                        token: request.cardData.token,
                    },
                } : undefined,
                confirm: true,
                return_url: process.env.STRIPE_RETURN_URL || `${process.env.CLIENT_URL}/payment/success`,
                metadata: {
                    ...request.metadata,
                    method: request.method,
                    processedAt: new Date().toISOString(),
                },
            });
            return this.handleStripeIntentResult(paymentIntent);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleStripeIntentResult(paymentIntent: any): PaymentGatewayResponse {
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