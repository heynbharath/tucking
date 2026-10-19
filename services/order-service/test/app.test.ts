import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Order Service Health, Metrics & Middleware', () => {
  const app = createApp();

  it('responds with 200 on /health/live', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'live', service: 'order-service' });
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('responds with 200 on /health/ready', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready', service: 'order-service' });
  });

  it('exposes Prometheus metrics at /metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('order_service_');
  });

  it('returns standard error structure for unknown routes', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeDefined();
  });
});
