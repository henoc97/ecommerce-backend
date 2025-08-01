import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
    @ApiProperty({
        description: 'ID de la commande à payer',
        example: 1,
        type: Number
    })
    orderId: number;

    @ApiProperty({
        description: 'Méthode de paiement (stripe, paypal)',
        example: 'stripe',
        enum: ['stripe', 'paypal']
    })
    method: string;

    @ApiProperty({
        description: 'Montant du paiement',
        example: 99.99,
        type: Number
    })
    amount: number;

    @ApiProperty({
        description: 'Devise du paiement',
        example: 'USD',
        enum: ['USD', 'EUR', 'XOF', 'CAD']
    })
    currency: string;

    @ApiProperty({
        description: 'Données de carte pour Stripe',
        required: false,
        type: Object,
        example: {
            cardData: {
                token: 'tok_visa'
            }
        }
    })
    cardData?: any;

    @ApiProperty({
        description: 'Données PayPal',
        required: false,
        type: Object,
        example: {
            paymentMethodId: 'pay_1234567890'
        }
    })
    paypalData?: any;
}

export class PaymentResponseDto {
    success: boolean;
    payment?: {
        providerId: string;
        transactionId: string;
        method: string;
        processedAt: string;
    };
    error?: string;
    details?: any;
}