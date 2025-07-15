import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
    private serviceId: string;
    private templateId: string;
    private userId: string;
    private apiUrl: string;
    constructor() {
        this.intialize();
    }

    private intialize() {
        this.serviceId = process.env.EMAILJS_SERVICE_ID!;
        this.templateId = process.env.EMAILJS_TEMPLATE_ID!;
        this.userId = process.env.EMAILJS_USER_ID!;
        this.apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    }

    async sendBulk(emails: string[], subject: string, content: string, type: string): Promise<void> {
        for (const email of emails) {
            await this.send(email, subject, content, type);
        }
    }

    async send(to: string, subject: string, content: string, type: string): Promise<void> {
        try {
            await axios.post(this.apiUrl, {
                service_id: this.serviceId,
                template_id: this.templateId,
                user_id: this.userId,
                template_params: {
                    to_email: to,
                    subject,
                    content,
                    type,
                },
            });
        } catch (error) {
            throw new Error(`EmailJS error: ${error?.response?.data || error.message}`);
        }
    }
} 