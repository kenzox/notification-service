// Email types
export interface EmailRequest {
    to: string[];
    locale?: string;
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
    | 'hotel-reservation'
    | 'package-reservation'
    | 'transfer-reservation'
    | 'welcome'
    | 'password-reset';

export type Locale = 'tr' | 'en';
