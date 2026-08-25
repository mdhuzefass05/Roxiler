import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { createAdminToken, createUserToken, createOwnerToken, setupMockDatabase } from './helpers.js';

test('USERS & ADMIN AUTHORIZATION SUITE: /api/v1/users', async (t) => {
  setupMockDatabase();

  await t.test('GET /users - SYSTEM_ADMIN can access user listing', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.users));
    assert.ok(res.body.data.pagination);
  });

  await t.test('GET /users - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /users - STORE_OWNER is rejected with 403 Forbidden', async () => {
    const token = createOwnerToken();
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /users - rejects invalid role', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Name Longer Than Twenty Characters',
        email: 'invalid.role@example.com',
        password: 'Password123!',
        address: '123 Test Street, Springfield',
        role: 'SUPER_SUPER_USER',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /users - rejects invalid address exceeding 400 chars', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Name Longer Than Twenty Characters',
        email: 'invalid.address@example.com',
        password: 'Password123!',
        address: 'A'.repeat(405),
        role: 'STORE_OWNER',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /admin/stats - SYSTEM_ADMIN can retrieve platform metrics', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.users !== undefined || res.body.data.total_users !== undefined);
  });
});
