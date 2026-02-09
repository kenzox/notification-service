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
            const intlLocale = 'en-GB'; // Enforce the format: 7 July 2025
            const d = new Date(date);
            const day = d.getDate().toString();
            const month = d.toLocaleDateString(intlLocale, { month: 'short' });
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
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

        // Concatenate values into a single string.
        Handlebars.registerHelper('concat', function (...args: unknown[]) {
            const values = args.slice(0, -1);
            return values.map(v => (v === undefined || v === null ? '' : String(v))).join('');
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

        const context = { ...data, __i18n, __meta };

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
}
