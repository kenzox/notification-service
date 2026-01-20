import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.handler';

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new HttpError('Authorization header is missing', 401);
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new HttpError('Invalid authorization format. Use: Bearer <token>', 401);
    }

    const apiKey = process.env.API_KEY;

    if (!apiKey || token !== apiKey) {
        throw new HttpError('Invalid API key', 401);
    }

    next();
}
