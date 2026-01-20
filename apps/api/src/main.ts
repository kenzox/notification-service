import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { logger } from './utils/logger';
import { validateEnv } from './config/env.validation';

// Validate environment variables before starting
validateEnv();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`🚀 Notification Service running on port ${PORT}`);
    logger.info(`📚 API Docs available at http://localhost:${PORT}/docs`);
});
