import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Locale } from '@shared/types';
import { logger } from '../utils/logger';
import { LocaleService } from './locale.service';

export class TemplateService {
    private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
    private templatesDir: string;
    private partialsDir: string;
    private localeService: LocaleService;

    constructor(localeService: LocaleService) {
        this.localeService = localeService;
        this.templatesDir = path.resolve(process.cwd(), 'templates');
        this.partialsDir = path.resolve(process.cwd(), 'templates', 'partials');
        this.registerHelpers();
        this.registerPartials();
    }

    private registerHelpers(): void {
        const localeService = this.localeService;
        const parseDateInput = (input: string | Date): Date | null => {
            if (input instanceof Date) {
                return Number.isNaN(input.getTime()) ? null : input;
            }

            const normalized = String(input).trim();
            const dmyMatch = normalized.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
            if (dmyMatch) {
                const day = Number(dmyMatch[1]);
                const month = Number(dmyMatch[2]);
                const year = Number(dmyMatch[3]);
                const parsed = new Date(year, month - 1, day);
                return Number.isNaN(parsed.getTime()) ? null : parsed;
            }

            const textMatch = normalized.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
            if (textMatch) {
                const monthMap: Record<string, number> = {
                    jan: 0, january: 0, ocak: 0,
                    feb: 1, february: 1, subat: 1, sub: 1,
                    mar: 2, march: 2, mart: 2,
                    apr: 3, april: 3, nisan: 3,
                    may: 4, mayis: 4,
                    jun: 5, june: 5, haziran: 5,
                    jul: 6, july: 6, temmuz: 6,
                    aug: 7, august: 7, agustos: 7,
                    sep: 8, september: 8, eylul: 8,
                    oct: 9, october: 9, ekim: 9,
                    nov: 10, november: 10, kasim: 10,
                    dec: 11, december: 11, aralik: 11,
                };

                const day = Number(textMatch[1]);
                const monthToken = textMatch[2]
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z]/g, '');
                const year = Number(textMatch[3]);
                const month = monthMap[monthToken];
                if (month !== undefined) {
                    const parsed = new Date(year, month, day);
                    return Number.isNaN(parsed.getTime()) ? null : parsed;
                }
            }

            const parsed = new Date(normalized);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };

        // Translation helper: {{t "welcome.title"}} or {{t "key" name=value}}
        Handlebars.registerHelper('t', function (this: any, key: string, options: Handlebars.HelperOptions) {
            const rootMeta = options.data?.root?.__meta as { locale: Locale } | undefined;
            const meta = (this?.__meta || rootMeta) as { locale: Locale } | undefined;

            if (!meta?.locale) {
                logger.warn({ key }, 't helper missing locale');
                return '';
            }

            let translation = localeService.getTranslation(meta.locale, key);
            if (!translation) {
                logger.warn({ key, locale: meta.locale }, 't helper empty translation');
            }
            if (options?.hash) {
                for (const [param, value] of Object.entries(options.hash)) {
                    translation = translation.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value ?? ''));
                }
            }
            return translation;
        });

        // RTL block helper: {{#ifRTL}}...{{else}}...{{/ifRTL}}
        Handlebars.registerHelper('ifRTL', function (this: Record<string, unknown>, options: Handlebars.HelperOptions) {
            const rootMeta = options.data?.root?.__meta as { direction: string } | undefined;
            const meta = (this.__meta || rootMeta) as { direction: string } | undefined;
            if (meta?.direction === 'rtl') {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        // Locale-aware date formatting
        Handlebars.registerHelper('formatDate', function (this: Record<string, unknown>, date: string | Date) {
            if (!date) {
                logger.warn('formatDate helper received undefined date');
                return '';
            }
            const d = parseDateInput(date);
            if (!d) {
                return String(date);
            }
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = String(d.getDate()).padStart(2, '0');
            return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
        });

        Handlebars.registerHelper('formatDateRange', function (this: Record<string, unknown>, value: unknown) {
            if (value === undefined || value === null || value === '') {
                return '';
            }
            const raw = String(value).trim();
            const separator = ' - ';
            if (!raw.includes(separator)) {
                return Handlebars.helpers.formatDate.call(this, raw);
            }

            const [from, to] = raw.split(separator);
            if (!from || !to) {
                return raw;
            }

            const fromFormatted = Handlebars.helpers.formatDate.call(this, from.trim());
            const toFormatted = Handlebars.helpers.formatDate.call(this, to.trim());
            return `${fromFormatted} - ${toFormatted}`;
        });

        // Locale-aware currency formatting
        Handlebars.registerHelper('formatCurrency', function (this: Record<string, unknown>, amount: number, currency: string) {
            if (amount === undefined || amount === null) {
                logger.warn('formatCurrency helper received undefined amount');
                return '';
            }
            const meta = this.__meta as { intlLocale: string } | undefined;
            const intlLocale = meta?.intlLocale || 'tr-TR';
            return new Intl.NumberFormat(intlLocale, {
                style: 'currency',
                currency: currency || 'TRY',
            }).format(amount);
        });

        // Conditional equality helper
        Handlebars.registerHelper('ifEquals', function (this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('equalsIgnoreCase', function (arg1: unknown, arg2: unknown) {
            if (arg1 === undefined || arg1 === null || arg2 === undefined || arg2 === null) {
                return false;
            }
            return String(arg1).trim().toLowerCase() === String(arg2).trim().toLowerCase();
        });

        // Arithmetic helper
        Handlebars.registerHelper('add', (a: number, b: number) => a + b);

        // Returns the first non-empty value. Usage: {{or value "fallback"}}
        Handlebars.registerHelper('or', function (...args: unknown[]) {
            const values = args.slice(0, -1);
            for (const value of values) {
                if (value !== undefined && value !== null && value !== '') {
                    return value;
                }
            }
            return '';
        });

        // Returns first non-placeholder value; ignores "-", "--", "—", "N/A", "NA".
        Handlebars.registerHelper('firstValid', function (...args: unknown[]) {
            const values = args.slice(0, -1);
            for (const value of values) {
                if (value === undefined || value === null) {
                    continue;
                }
                const text = String(value).trim();
                if (text === '') {
                    continue;
                }
                if (['-', '--', '—', 'n/a', 'na'].includes(text.toLowerCase())) {
                    continue;
                }
                return value;
            }
            return '';
        });

        // Concatenate values into a single string.
        Handlebars.registerHelper('concat', function (...args: unknown[]) {
            const values = args.slice(0, -1);
            return values.map(v => (v === undefined || v === null ? '' : String(v))).join('');
        });

        // Normalize guest prefixes for reservation templates.
        Handlebars.registerHelper('guestPrefix', function (guest: unknown) {
            if (!guest || typeof guest !== 'object' || Array.isArray(guest)) {
                return 'Mr';
            }

            const g = guest as Record<string, unknown>;
            const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase();
            const identityValues = [
                normalize(g.title),
                normalize(g.type),
                normalize(g.passengerType),
                normalize(g.guestType),
            ];

            if (identityValues.some(v => ['chd', 'child', 'infant', 'cnn'].includes(v))) {
                return 'Chd';
            }

            if (identityValues.some(v => ['mrs', 'ms', 'miss', 'female'].includes(v))) {
                return 'Mrs';
            }

            const gender = normalize(g.gender);
            if (['f', 'female', 'woman'].includes(gender)) {
                return 'Mrs';
            }

            return 'Mr';
        });

        // Current date helper: {{formatDate (now)}}
        Handlebars.registerHelper('now', function () {
            return new Date();
        });

        // Safe variable access helper
        Handlebars.registerHelper('safe', function (value: unknown, fieldName: string) {
            if (value === undefined || value === null || value === '') {
                logger.warn({ field: fieldName }, 'Template field is missing or empty');
                return '';
            }
            return value;
        });
    }

    async render(templateKey: string, locale: string, data: Record<string, unknown>): Promise<string> {
        const validLocale = locale as Locale;
        const resolvedTemplateKey = this.resolveTemplateKey(templateKey);

        let template = this.templateCache.get(resolvedTemplateKey);

        if (!template) {
            template = await this.loadTemplate(resolvedTemplateKey);
            this.templateCache.set(resolvedTemplateKey, template);
        }

        const __i18n = this.localeService.getTranslations(validLocale);
        const __meta = this.localeService.getMeta(validLocale);
        const normalizedData = this.normalizeTemplateData(data);
        const context = { ...normalizedData, __i18n, __meta };

        try {
            return template(context);
        } catch (error) {
            logger.error({ templateKey, resolvedTemplateKey, locale, error }, 'Template rendering failed');
            throw error;
        }
    }

    hasTemplate(templateKey: string): boolean {
        const resolvedTemplateKey = this.resolveTemplateKey(templateKey);
        const templatePath = path.join(this.templatesDir, `${resolvedTemplateKey}.hbs`);
        return fs.existsSync(templatePath);
    }

    private resolveTemplateKey(templateKey: string): string {
        return templateKey;
    }

    private async loadTemplate(templateKey: string): Promise<HandlebarsTemplateDelegate> {
        const templatePath = path.join(this.templatesDir, `${templateKey}.hbs`);

        let templateContent: string;

        try {
            templateContent = fs.readFileSync(templatePath, 'utf-8');
        } catch {
            throw new Error(`Template not found: ${templateKey}`);
        }

        return Handlebars.compile(templateContent);
    }

    private registerPartials(): void {
        if (!fs.existsSync(this.partialsDir)) {
            logger.info('No partials directory found, skipping partial registration');
            return;
        }

        const files = fs.readdirSync(this.partialsDir).filter(f => f.endsWith('.hbs'));
        for (const file of files) {
            const name = path.basename(file, '.hbs');
            const content = fs.readFileSync(path.join(this.partialsDir, file), 'utf-8');
            Handlebars.registerPartial(name, content);
        }

        logger.info({ count: files.length }, 'Handlebars partials registered');
    }

    clearCache(): void {
        this.templateCache.clear();
        this.registerPartials();
    }

    private normalizeTemplateData(data: Record<string, unknown>): Record<string, unknown> {
        const normalized: Record<string, unknown> = { ...data };
        const payment = this.asRecord(data.payment);

        const paymentDate = this.pickFirst(
            data.paymentDate,
            payment?.paymentDate
        );
        const paymentStatus = this.pickFirst(
            data.paymentStatus,
            data.paidStatus,
            payment?.paymentStatus,
            payment?.paidStatus
        );
        const cardBrand = this.pickFirst(
            data.cardBrand,
            data.cardType,
            payment?.cardBrand,
            payment?.cardType
        );
        const cardLast4 = this.pickFirst(
            data.cardLast4,
            data.cardLastFour,
            data.cardLastDigits,
            data.cardNumberLast4,
            payment?.cardLast4,
            payment?.cardLastFour,
            payment?.cardLastDigits,
            payment?.cardNumberLast4
        );
        const cardHolder = this.pickFirst(
            data.cardHolder,
            data.cardHolderName,
            payment?.cardHolder,
            payment?.cardHolderName,
            data.customerName
        );
        const currency = this.pickFirst(
            data.currency,
            payment?.currency
        );
        const totalAmount = this.pickFirst(
            data.totalAmount,
            payment?.totalAmount,
            data.approximateAmount
        );
        const cardLogoUrl = this.pickFirst(
            data.cardLogoUrl,
            payment?.cardLogoUrl
        );

        if (paymentDate !== undefined) normalized.paymentDate = paymentDate;
        if (paymentStatus !== undefined) normalized.paymentStatus = paymentStatus;
        if (cardBrand !== undefined) normalized.cardBrand = cardBrand;
        if (cardLast4 !== undefined) normalized.cardLast4 = cardLast4;
        if (cardHolder !== undefined) normalized.cardHolder = cardHolder;
        if (currency !== undefined) normalized.currency = currency;
        if (totalAmount !== undefined) normalized.totalAmount = totalAmount;

        const safeCardLogoUrl = this.sanitizeCardLogoUrl(cardLogoUrl);
        if (safeCardLogoUrl !== undefined) {
            normalized.cardLogoUrl = safeCardLogoUrl;
        }

        return normalized;
    }

    private pickFirst(...values: unknown[]): unknown {
        for (const value of values) {
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
        return undefined;
    }

    private asRecord(value: unknown): Record<string, unknown> | undefined {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
        return undefined;
    }

    private sanitizeCardLogoUrl(value: unknown): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        const url = value.trim();
        if (!url) {
            return undefined;
        }

        if (url.startsWith('cid:') || url.startsWith('data:') || url.startsWith('/')) {
            return url;
        }

        return undefined;
    }
}
