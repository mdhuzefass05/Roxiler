import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import env from '../src/config/env.js';
import { createAdminToken, createUserToken, createOwnerToken, setupMockDatabase } from './helpers.js';

test('RED TEAM SECURITY SUITE: Penetration & Abuse Testing', async (t) => {
  setupMockDatabase();

  // ── 1. JWT Attack Scenarios ────────────────────────────────────────────────
  await t.test('JWT: Reject token with modified/tampered payload signature', async () => {
    const validToken = createUserToken();
    const [header, payload, signature] = validToken.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ id: 1, role: 'SYSTEM_ADMIN' })).toString('base64url');
    const forgedToken = `${header}.${tamperedPayload}.${signature}`;

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${forgedToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('JWT: Reject token signed with wrong secret key', async () => {
    const attackerToken = jwt.sign(
      { id: 1, role: 'SYSTEM_ADMIN', email: 'attacker@evil.com' },
      'wrong_unauthorized_secret_key_123456',
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${attackerToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('JWT: Reject expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 1, role: 'SYSTEM_ADMIN' },
      env.jwt.secret,
      { algorithm: 'HS256', expiresIn: '-10s' }
    );

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('JWT: Reject none algorithm / unsigned token', async () => {
    const unsignedToken = jwt.sign(
      { id: 1, role: 'SYSTEM_ADMIN' },
      '',
      { algorithm: 'none' }
    );

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${unsignedToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // ── 2. Privilege Escalation & RBAC ─────────────────────────────────────────
  await t.test('RBAC: NORMAL_USER cannot invoke admin user creation', async () => {
    const userToken = createUserToken();
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Attacker Account Name Long Enough',
        email: 'attacker@storerate.dev',
        password: 'Password@123',
        address: '123 Fake Street, City',
        role: 'SYSTEM_ADMIN',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('RBAC: STORE_OWNER cannot access admin metrics', async () => {
    const ownerToken = createOwnerToken();
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${ownerToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('RBAC: NORMAL_USER cannot access store owner analytics', async () => {
    const userToken = createUserToken();
    const res = await request(app)
      .get('/api/v1/stores/my-store/stats')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  // ── 3. Mass Assignment & Input Sanitization ────────────────────────────────
  await t.test('Mass Assignment: Self-registration ignores injected role=SYSTEM_ADMIN', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Injected Role Customer Account',
        email: 'injected.role@example.com',
        password: 'Password@123',
        address: '123 Safe Address Lane, Boston',
        role: 'SYSTEM_ADMIN',
      });

    if (res.status === 201) {
      assert.equal(res.body.data.user.role, 'NORMAL_USER');
    }
  });

  // ── 4. SQL Injection Resistance ────────────────────────────────────────────
  await t.test('SQLi: Store catalog search safely handles SQL injection strings', async () => {
    const userToken = createUserToken();
    const sqlPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE users; --",
      "admin' UNION SELECT null, null, null --",
    ];

    for (const payload of sqlPayloads) {
      const res = await request(app)
        .get(`/api/v1/stores?name=${encodeURIComponent(payload)}`)
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    }
  });

  // ── 5. Business Logic & Rating Integrity ───────────────────────────────────
  await t.test('Rating: Rejects rating out of 1-5 bounds (e.g. -5, 0, 6, 999)', async () => {
    const userToken = createUserToken();
    for (const invalidRating of [-5, 0, 6, 999]) {
      const res = await request(app)
        .post('/api/v1/ratings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ storeId: 1, rating: invalidRating });

      assert.equal(res.status, 422);
      assert.equal(res.body.success, false);
    }
  });

  await t.test('Rating: Rejects non-integer float rating (e.g. 4.9)', async () => {
    const userToken = createUserToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ storeId: 1, rating: 4.9 });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  // ── 6. Sensitive Information Protection ────────────────────────────────────
  await t.test('Data Leakage: Password hash is never exposed in user responses', async () => {
    const adminToken = createAdminToken();
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    const users = res.body.data.users || [];
    for (const user of users) {
      assert.equal(user.password, undefined);
      assert.equal(user.password_hash, undefined);
    }
  });
});
