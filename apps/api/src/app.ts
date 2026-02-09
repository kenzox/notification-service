import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/error.handler';
import { requestIdMiddleware } from './middleware/request.id';
import { requestLogger } from './middleware/request.logger';
import { rateLimiter } from './middleware/rate.limiter';
import { emailRouter } from './routes/email.routes';
import { healthRouter } from './routes/health.routes';
import { setupSwagger } from './config/swagger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request ID (before logging)
app.use(requestIdMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Swagger documentation
setupSwagger(app);

// Routes
app.use('/health', healthRouter);
app.use('/api/email', rateLimiter, emailRouter);

// Error handling
app.use(errorHandler);

export { app };
