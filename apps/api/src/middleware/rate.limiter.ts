import { Request, Response, NextFunction } from 'express';

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

const buckets = new Map<string, TokenBucket>();

function getBucket(key: string): TokenBucket {
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket) {
        bucket = { tokens: MAX_REQUESTS, lastRefill: now };
        buckets.set(key, bucket);
        return bucket;
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed >= WINDOW_MS) {
        bucket.tokens = MAX_REQUESTS;
        bucket.lastRefill = now;
    }

    return bucket;
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || 'unknown';
    const bucket = getBucket(key);

    const resetTime = Math.ceil((bucket.lastRefill + WINDOW_MS) / 1000);

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, bucket.tokens - 1).toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());

    if (bucket.tokens <= 0) {
        res.status(429).json({
            success: false,
            error: {
                message: 'Too Many Requests. Please try again later.',
            },
        });
        return;
    }

    bucket.tokens--;
    next();
}
