import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { createAdminToken, createUserToken, createOwnerToken, setupMockDatabase } from './helpers.js';

test('STORE OWNER SUITE: /api/v1/stores/my-store', async (t) => {
  setupMockDatabase();

  await t.test('GET /stores/my-store - STORE_OWNER can access their dashboard profile', async () => {
    const token = createOwnerToken({ id: 2 });
    const res = await request(app)
      .get('/api/v1/stores/my-store')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  await t.test('GET /stores/my-store - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .get('/api/v1/stores/my-store')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /stores/my-store/ratings - STORE_OWNER can access customer reviews list', async () => {
    const token = createOwnerToken({ id: 2 });
    const res = await request(app)
      .get('/api/v1/stores/my-store/ratings')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.ratings !== undefined);
    assert.ok(res.body.data.pagination !== undefined);
  });

  await t.test('GET /stores/my-store/ratings - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .get('/api/v1/stores/my-store/ratings')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /stores/my-store/stats - STORE_OWNER can access rating statistics', async () => {
    const token = createOwnerToken({ id: 2 });
    const res = await request(app)
      .get('/api/v1/stores/my-store/stats')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  await t.test('GET /stores/my-store/stats - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .get('/api/v1/stores/my-store/stats')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });
});
