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