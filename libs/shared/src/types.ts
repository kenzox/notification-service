// Email types
export interface EmailRequest {
    to: string[];
    locale?: Locale;
    subject?: string;
    data?: Record<string, unknown>;
    meta?: EmailMeta;
}

export interface EmailMeta {
    reply_to?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    path?: string;
    content?: string;
}

// Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    message: string;
    details?: unknown[];
}

// Template types
export type TemplateKey =
    | 'reservation-confirmation'
    | 'flight-ticket'
    | 'flight-details'
    | 'hotel-reservation'
    | 'package-reservation'
    | 'transfer-reservation'
    | 'welcome'
    | 'password-reset';

export const TEMPLATE_KEYS: TemplateKey[] = [
    'reservation-confirmation',
    'flight-ticket',
    'flight-details',
    'hotel-reservation',
    'package-reservation',
    'transfer-reservation',
    'welcome',
    'password-reset',
];

// Locale types
export type Locale = 'tr' | 'en' | 'ar' | 'he';
export type Direction = 'ltr' | 'rtl';

export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en', 'ar', 'he'];
export const RTL_LOCALES: Locale[] = ['ar', 'he'];

export interface I18nMeta {
    locale: Locale;
    direction: Direction;
    align: string;
    oppositeAlign: string;
    fontFamily: string;
    intlLocale: string;
    logoUrl?: string;
}
