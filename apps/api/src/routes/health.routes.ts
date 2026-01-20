import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export { healthRouter };
