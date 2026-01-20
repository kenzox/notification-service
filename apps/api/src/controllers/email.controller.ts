import { Request, Response, NextFunction } from 'express';
import { MailService } from '../services/mail.service';
import { TemplateService } from '../services/template.service';
import { emailRequestSchema } from '../schemas/email.schema';
import { logger } from '../utils/logger';

export class EmailController {
    private mailService: MailService;
    private templateService: TemplateService;

    constructor() {
        this.mailService = new MailService();
        this.templateService = new TemplateService();
    }

    private async sendEmail(
        req: Request,
        res: Response,
        next: NextFunction,
        templateKey: string
    ): Promise<void> {
        try {
            const validation = emailRequestSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        details: validation.error.errors,
                    },
                });
                return;
            }

            const { to, locale, subject, data, meta } = validation.data;

            // Render template
            const html = await this.templateService.render(templateKey, locale, data);

            // Send email
            await this.mailService.send({
                to,
                subject: subject || this.getDefaultSubject(templateKey, locale),
                html,
                replyTo: meta?.reply_to,
                cc: meta?.cc,
                bcc: meta?.bcc,
            });

            logger.info({ templateKey, to, locale }, 'Email sent successfully');

            res.json({
                success: true,
                message: 'Email sent successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    private getDefaultSubject(templateKey: string, locale: string): string {
        const subjects: Record<string, Record<string, string>> = {
            'reservation-confirmation': {
                tr: 'Rezervasyon Onayı',
                en: 'Reservation Confirmation',
            },
            'flight-ticket': {
                tr: 'Uçak Bileti',
                en: 'Flight Ticket',
            },
            'hotel-reservation': {
                tr: 'Otel Rezervasyonu',
                en: 'Hotel Reservation',
            },
            'package-reservation': {
                tr: 'Paket Rezervasyonu',
                en: 'Package Reservation',
            },
            'transfer-reservation': {
                tr: 'Transfer Rezervasyonu',
                en: 'Transfer Reservation',
            },
            welcome: {
                tr: 'Hoş Geldiniz',
                en: 'Welcome',
            },
            'password-reset': {
                tr: 'Şifre Sıfırlama',
                en: 'Password Reset',
            },
        };

        return subjects[templateKey]?.[locale] || subjects[templateKey]?.en || templateKey;
    }

    sendReservationConfirmation = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'reservation-confirmation');

    sendFlightTicket = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'flight-ticket');

    sendHotelReservation = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'hotel-reservation');

    sendPackageReservation = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'package-reservation');

    sendTransferReservation = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'transfer-reservation');

    sendWelcome = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'welcome');

    sendPasswordReset = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'password-reset');
}
