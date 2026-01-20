import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Notification Service API',
        version: '1.0.0',
        description: 'Email notification service for Calibre Tour',
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
                        default: 'tr',
                        description: 'Template locale (tr, en)',
                    },
                    subject: {
                        type: 'string',
                        description: 'Email subject (optional, uses default if not provided)',
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
                    401: { description: 'Unauthorized' },
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
                    401: { description: 'Unauthorized' },
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
                    401: { description: 'Unauthorized' },
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
                    401: { description: 'Unauthorized' },
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
                    401: { description: 'Unauthorized' },
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
                    401: { description: 'Unauthorized' },
                },
            },
        },
    },
};

export function setupSwagger(app: Express): void {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
