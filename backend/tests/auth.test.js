import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { createAdminToken, createTestToken, setupMockDatabase } from './helpers.js';

test('AUTH SUITE: /api/v1/auth', async (t) => {
  setupMockDatabase();
  await t.test('POST /auth/login - fails with missing credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors);
  });

  await t.test('POST /auth/login - fails with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'invalid-email', password: 'Password123!' });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /auth/register - fails with short name (< 20 chars)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Short Name',
        email: 'short.name@example.com',
        password: 'Password123!',
        address: '123 Test Street, Springfield',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /auth/register - fails with weak password (no uppercase or special char)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Valid Long Name For Test User',
        email: 'valid.name@example.com',
        password: 'lowercaseonly123',
        address: '123 Test Street, Springfield',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /auth/me - fails without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /auth/me - fails with malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-string');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('PATCH /auth/change-password - fails with validation on weak new password', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'OldPassword123!',
        newPassword: 'short',
        confirmPassword: 'short',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('PATCH /auth/change-password - fails if new password matches current password', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /auth/logout - succeeds when authenticated', async () => {
    const token = createTestToken();
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Logged out successfully.');
  });
});
