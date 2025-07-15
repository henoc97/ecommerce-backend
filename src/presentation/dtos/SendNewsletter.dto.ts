export class SendNewsletterDto {
    shopId: number;
    subject: string;
    content: string;
    type: 'PROMOTION' | 'ORDER_UPDATE' | 'INFO' | 'WARNING';
} 