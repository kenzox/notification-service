import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info({
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
}
