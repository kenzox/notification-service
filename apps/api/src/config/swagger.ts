import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Notification Service API',
        version: '2.0.0',
        description: 'Email notification service for Calibre Tour - Supports 4 languages (tr, en, ar, he) with RTL support',
    },
    servers: [
        {
            url: '/api',
            description: 'API Server',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
            },
        },
        schemas: {
            EmailRequest: {
                type: 'object',
                required: ['to'],
                properties: {
                    to: {
                        type: 'array',
                        items: { type: 'string', format: 'email' },
                        description: 'List of recipient email addresses',
                    },
                    locale: {
                        type: 'string',
                        enum: ['tr', 'en', 'ar', 'he'],
                        default: 'tr',
                        description: 'Template locale. Supports Turkish (tr), English (en), Arabic (ar), Hebrew (he). Arabic and Hebrew use RTL layout.',
                    },
                    subject: {
                        type: 'string',
                        description: 'Email subject (optional, uses locale-specific default if not provided)',
                    },
                    data: {
                        type: 'object',
                        description: 'Template variables',
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            reply_to: { type: 'string', format: 'email' },
                            cc: { type: 'array', items: { type: 'string', format: 'email' } },
                            bcc: { type: 'array', items: { type: 'string', format: 'email' } },
                            attachments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        filename: { type: 'string' },
                                        path: { type: 'string' },
                                        content: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Email sent successfully' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            details: { type: 'array', items: { type: 'object' } },
                        },
                    },
                },
            },
            RateLimitResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                        type: 'object',
                        properties: {
                            message: { type: 'string', example: 'Too Many Requests. Please try again later.' },
                        },
                    },
                },
            },
        },
    },
    security: [{ BearerAuth: [] }],
    paths: {
        '/email/reservation-confirmation': {
            post: {
                tags: ['Email'],
                summary: 'Send reservation confirmation email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                            examples: {
                                turkish: {
                                    summary: 'Turkish',
                                    value: { to: ['user@example.com'], locale: 'tr', data: { customerName: 'Ahmet Yılmaz', reservationNumber: 'RES-12345', reservationDate: '2026-03-15', totalAmount: 2500, currency: 'TRY' } },
                                },
                                english: {
                                    summary: 'English',
                                    value: { to: ['user@example.com'], locale: 'en', data: { customerName: 'John Doe', reservationNumber: 'RES-12345', reservationDate: '2026-03-15', totalAmount: 500, currency: 'USD' } },
                                },
                                arabic: {
                                    summary: 'Arabic (RTL)',
                                    value: { to: ['user@example.com'], locale: 'ar', data: { customerName: 'أحمد محمد', reservationNumber: 'RES-12345', reservationDate: '2026-03-15', totalAmount: 1500, currency: 'SAR' } },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Email sent successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SuccessResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: {
                        description: 'Too Many Requests',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RateLimitResponse' },
                            },
                        },
                    },
                    500: { description: 'Internal server error' },
                },
            },
        },
        '/email/flight-ticket': {
            post: {
                tags: ['Email'],
                summary: 'Send flight ticket email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/flight-details': {
            post: {
                tags: ['Email'],
                summary: 'Send flight details email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/hotel-reservation': {
            post: {
                tags: ['Email'],
                summary: 'Send hotel reservation email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/package-reservation': {
            post: {
                tags: ['Email'],
                summary: 'Send package reservation email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/transfer-reservation': {
            post: {
                tags: ['Email'],
                summary: 'Send transfer reservation email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/welcome': {
            post: {
                tags: ['Email'],
                summary: 'Send welcome email for new members',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
        '/email/password-reset': {
            post: {
                tags: ['Email'],
                summary: 'Send password reset email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Email sent successfully' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    429: { description: 'Too Many Requests' },
                },
            },
        },
    },
};

export function setupSwagger(app: Express): void {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
