import { Request, Response, NextFunction } from 'express';
import { Locale } from '@shared/types';
import { MailService } from '../services/mail.service';
import { TemplateService } from '../services/template.service';
import { LocaleService } from '../services/locale.service';
import { emailRequestSchema } from '../schemas/email.schema';
import { logger } from '../utils/logger';

export class EmailController {
    private mailService: MailService;
    private templateService: TemplateService;
    private localeService: LocaleService;

    constructor() {
        this.localeService = new LocaleService();
        this.mailService = new MailService();
        this.templateService = new TemplateService(this.localeService);
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

            if (!this.templateService.hasTemplate(templateKey)) {
                res.status(501).json({
                    success: false,
                    error: {
                        message: `Template not configured: ${templateKey}`,
                    },
                });
                return;
            }

            // Render template
            const html = await this.templateService.render(templateKey, locale, data);

            // Send email
            await this.mailService.send({
                to,
                subject: subject || this.localeService.getSubject(locale as Locale, templateKey),
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

    sendReservationConfirmation = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'reservation-confirmation');

    sendFlightTicket = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'flight-ticket');

    sendFlightDetails = (req: Request, res: Response, next: NextFunction) =>
        this.sendEmail(req, res, next, 'flight-details');

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
