import { z } from 'zod';
import { logger } from '../utils/logger';

const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    API_KEY: z.string().min(1, 'API_KEY is required'),
    SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
    SMTP_PORT: z.string().default('587'),
    SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
    SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
    SMTP_SECURE: z.string().default('false'),
    SMTP_FROM: z.string().email('SMTP_FROM must be a valid email'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        logger.error('❌ Environment validation failed:');
        result.error.errors.forEach((err) => {
            logger.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }

    logger.info('✅ Environment variables validated successfully');
    return result.data;
}

export function getEnv(): EnvConfig {
    return envSchema.parse(process.env);
}
