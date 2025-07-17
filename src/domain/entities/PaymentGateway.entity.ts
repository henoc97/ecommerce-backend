export interface PaymentGatewayRequest {
    amount: number;
    currency: string;
    method: string;
    cardData?: {
        token: string;
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