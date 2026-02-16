import * as fs from 'fs';
import * as path from 'path';
import { Locale, SUPPORTED_LOCALES, I18nMeta } from '../../../../libs/shared/src/types';
import { logger } from '../utils/logger';

interface LocaleMeta {
    direction: string;
    align: string;
    fontFamily: string;
}

interface LocaleFileData {
    meta: LocaleMeta;
    subjects: Record<string, string>;
    [key: string]: unknown;
}

const TEMPLATE_KEY_TO_SUBJECT: Record<string, string> = {
    'welcome': 'welcome',
    'password-reset': 'passwordReset',
    'flight-ticket': 'flightTicket',
    'flight-details': 'flightDetails',
    'hotel-reservation': 'hotelReservation',
    'reservation-confirmation': 'reservationConfirmation',
    'package-reservation': 'packageReservation',
    'transfer-reservation': 'transferReservation',
};

export class LocaleService {
    private locales: Map<string, LocaleFileData> = new Map();
    private localesDir: string;

    constructor() {
        this.localesDir = path.resolve(process.cwd(), 'locales');
        this.loadAllLocales();
    }

    private loadAllLocales(): void {
        for (const locale of SUPPORTED_LOCALES) {
            const filePath = path.join(this.localesDir, `${locale}.json`);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Locale file not found: ${filePath}`);
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content) as LocaleFileData;
            this.locales.set(locale, data);

            logger.info({ locale, path: filePath }, 'Locale file loaded');
        }

        logger.info({ count: this.locales.size }, 'All locale files loaded successfully');
    }

    getTranslation(locale: Locale, key: string): string {
        const parts = key.split('.');
        const chain: Locale[] = [locale, 'en', 'tr'];

        for (const tryLocale of chain) {
            const data = this.locales.get(tryLocale);
            if (!data) continue;

            const value = this.resolveKey(data, parts);
            if (value !== undefined) {
                if (tryLocale !== locale) {
                    logger.warn({ key, requested: locale, resolved: tryLocale }, 'Translation fallback');
                }
                return value;
            }
        }

        logger.warn({ key, locale }, 'Translation not found in any locale');
        return '';
    }

    getTranslations(locale: Locale): Record<string, unknown> {
        const data = this.locales.get(locale);
        if (!data) {
            logger.warn({ locale }, 'Locale data not found, falling back to tr');
            return this.locales.get('tr') || {};
        }
        return data;
    }

    getMeta(locale: Locale): I18nMeta {
        const data = this.locales.get(locale);
        const meta = data?.meta;

        if (!meta) {
            return {
                locale,
                direction: 'ltr',
                align: 'left',
                oppositeAlign: 'right',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                intlLocale: 'tr-TR',
            };
        }

        const intlLocaleMap: Record<string, string> = {
            tr: 'tr-TR',
            en: 'en-US',
            ar: 'ar-SA',
            he: 'he-IL',
        };

        return {
            locale,
            direction: meta.direction as 'ltr' | 'rtl',
            align: meta.align,
            oppositeAlign: meta.align === 'left' ? 'right' : 'left',
            fontFamily: meta.fontFamily,
            intlLocale: intlLocaleMap[locale] || 'en-US',
            logoUrl: 'cid:logo@calibretour',
        };
    }

    getSubject(locale: Locale, templateKey: string): string {
        const subjectKey = TEMPLATE_KEY_TO_SUBJECT[templateKey];
        if (!subjectKey) return templateKey;

        const chain: Locale[] = [locale, 'en', 'tr'];

        for (const tryLocale of chain) {
            const data = this.locales.get(tryLocale);
            if (data?.subjects?.[subjectKey]) {
                return data.subjects[subjectKey];
            }
        }

        return templateKey;
    }

    private resolveKey(obj: Record<string, unknown>, parts: string[]): string | undefined {
        let current: unknown = obj;

        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = (current as Record<string, unknown>)[part];
        }

        if (typeof current === 'string') {
            return current;
        }

        return undefined;
    }
}
