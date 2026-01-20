import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { logger } from '../utils/logger';

export class TemplateService {
    private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
    private templatesDir: string;

    constructor() {
        this.templatesDir = path.resolve(process.cwd(), 'templates');
        this.registerHelpers();
    }

    private registerHelpers(): void {
        // Format date helper
        Handlebars.registerHelper('formatDate', (date: string | Date) => {
            if (!date) {
                logger.warn('formatDate helper received undefined date');
                return '';
            }
            return new Date(date).toLocaleDateString('tr-TR');
        });

        // Format currency helper
        Handlebars.registerHelper('formatCurrency', (amount: number, currency: string) => {
            if (amount === undefined || amount === null) {
                logger.warn('formatCurrency helper received undefined amount');
                return '';
            }
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currency || 'TRY',
            }).format(amount);
        });

        // Conditional helper
        Handlebars.registerHelper('ifEquals', function (this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        });

        // Helper to safely access variables with logging
        Handlebars.registerHelper('safe', function (value: unknown, fieldName: string) {
            if (value === undefined || value === null || value === '') {
                logger.warn({ field: fieldName }, 'Template field is missing or empty');
                return '';
            }
            return value;
        });
    }

    async render(templateKey: string, locale: string, data: Record<string, unknown>): Promise<string> {
        const cacheKey = `${locale}/${templateKey}`;

        let template = this.templateCache.get(cacheKey);

        if (!template) {
            template = await this.loadTemplate(templateKey, locale);
            this.templateCache.set(cacheKey, template);
        }

        try {
            return template(data);
        } catch (error) {
            logger.warn({ templateKey, locale, error }, 'Template rendering had missing variables');
            // Still return the rendered template, just log the warning
            return template(data);
        }
    }

    private async loadTemplate(templateKey: string, locale: string): Promise<HandlebarsTemplateDelegate> {
        const templatePath = path.join(this.templatesDir, locale, `${templateKey}.hbs`);
        const fallbackPath = path.join(this.templatesDir, 'en', `${templateKey}.hbs`);

        let templateContent: string;

        try {
            templateContent = fs.readFileSync(templatePath, 'utf-8');
        } catch {
            logger.warn({ templateKey, locale }, 'Template not found for locale, falling back to en');
            try {
                templateContent = fs.readFileSync(fallbackPath, 'utf-8');
            } catch {
                throw new Error(`Template not found: ${templateKey}`);
            }
        }

        return Handlebars.compile(templateContent);
    }

    clearCache(): void {
        this.templateCache.clear();
    }
}
