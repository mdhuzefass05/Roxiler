import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { setupMockDatabase } from './helpers.js';

test('HEALTH & OBSERVABILITY SUITE', async (t) => {
  setupMockDatabase();

  await t.test('GET /health - returns 200 UP with database probe and timestamp', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.equal(res.body.database, 'connected');
    assert.ok(res.body.timestamp);
    assert.ok(res.headers['x-request-id']);
  });

  await t.test('GET /api/health - returns 200 UP with correlation ID header', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('X-Request-Id', 'custom-trace-id-12345');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.equal(res.headers['x-request-id'], 'custom-trace-id-12345');
  });
});
