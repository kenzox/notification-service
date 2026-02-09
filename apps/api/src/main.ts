import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { logger } from './utils/logger';
import { validateEnv } from './config/env.validation';

// Validate environment variables before starting
validateEnv();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Notification Service running on port ${PORT}`);
    logger.info(`API Docs available at http://localhost:${PORT}/docs`);
});

// Graceful shutdown
function gracefulShutdown(signal: string): void {
    logger.info({ signal }, 'Received shutdown signal, closing server...');

    server.close(() => {
        logger.info('Server closed gracefully');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
