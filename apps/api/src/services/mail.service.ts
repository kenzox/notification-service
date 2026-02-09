import * as path from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import { getEnv } from '../config/env.validation';
import { logger } from '../utils/logger';

export interface SendMailOptions {
    to: string[];
    subject: string;
    html: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
}

export class MailService {
    private transporter: Transporter;

    constructor() {
        const env = getEnv();

        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: parseInt(env.SMTP_PORT, 10),
            secure: env.SMTP_SECURE === 'true',
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Allow self-signed or mismatched certificates
            },
        });
    }

    async send(options: SendMailOptions): Promise<void> {
        const env = getEnv();

        try {
            const info = await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: options.to.join(', '),
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo,
                cc: options.cc?.join(', '),
                bcc: options.bcc?.join(', '),
                attachments: [
                    {
                        filename: 'logo.png',
                        path: path.join(process.cwd(), 'templates/logo.png'),
                        cid: 'logo',
                    },
                ],
            });

            logger.info({ messageId: info.messageId }, 'Email sent');
        } catch (error) {
            logger.error({ error }, 'Failed to send email');
            throw error;
        }
    }

    async verify(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}
