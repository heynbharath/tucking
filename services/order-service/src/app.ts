import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import client from 'prom-client';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'order_service_' });

export const ordersPlacedTotal = new client.Counter({
  name: 'order_service_orders_placed_total',
  help: 'Total number of orders successfully placed',
  registers: [register]
});

export const httpRequestsTotal = new client.Counter({
  name: 'order_service_http_requests_total',
  help: 'Total number of HTTP requests handled',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export function createApp() {
  const app = express();
  app.use(express.json());

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId = (req.header('x-request-id') as string) || randomUUID();
    res.locals.requestId = reqId;
    res.setHeader('x-request-id', reqId);

    res.on('finish', () => {
      const route = req.route ? req.route.path : req.path;
      httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString()
      });
    });

    next();
  });

  // Health checks
  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'live', service: 'order-service' });
  });

  app.get('/health/ready', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ready', service: 'order-service' });
  });

  // Prometheus metrics endpoint
  app.get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  // API Stubs
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.status(200).json({ orders: [] });
  });

  // 404 handler
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(404, 'NOT_FOUND', 'Route not found'));
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const requestId = (res.locals.requestId as string) || randomUUID();
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          requestId,
          ...(err.details ? { details: err.details } : {})
        }
      });
      return;
    }

    console.error(`[${requestId}] Internal Server Error:`, err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred',
        requestId
      }
    });
  });

  return app;
}
