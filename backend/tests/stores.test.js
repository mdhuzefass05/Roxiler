import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { createAdminToken, createUserToken, createOwnerToken, setupMockDatabase } from './helpers.js';

test('STORES SUITE: /api/v1/stores', async (t) => {
  setupMockDatabase();

  await t.test('GET /stores - Authenticated NORMAL_USER can browse stores', async () => {
    const token = createUserToken();
    const res = await request(app)
      .get('/api/v1/stores')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.stores));
    assert.ok(res.body.data.pagination);
  });

  await t.test('GET /stores - Unauthenticated request is rejected with 401', async () => {
    const res = await request(app).get('/api/v1/stores');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /stores - SYSTEM_ADMIN can submit store creation (validation test)', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Short',
        email: 'invalid-store-email',
        address: '123 Store Address',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /stores - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Store Name Longer Than Twenty Characters',
        email: 'store.test@example.com',
        address: '123 Valid Address, City',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /stores - STORE_OWNER is rejected with 403 Forbidden', async () => {
    const token = createOwnerToken();
    const res = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Store Name Longer Than Twenty Characters',
        email: 'store.test@example.com',
        address: '123 Valid Address, City',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });
});
