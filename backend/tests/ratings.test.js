import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { createAdminToken, createUserToken, createOwnerToken, setupMockDatabase } from './helpers.js';

test('RATINGS SUITE: /api/v1/ratings', async (t) => {
  setupMockDatabase();
  await t.test('POST /ratings - rejects rating below 1', async () => {
    const token = createUserToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ storeId: 1, rating: 0 });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings - rejects rating above 5', async () => {
    const token = createUserToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ storeId: 1, rating: 6 });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings - rejects decimal rating when expecting integer', async () => {
    const token = createUserToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ storeId: 1, rating: 4.5 });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings - STORE_OWNER is rejected with 403 Forbidden', async () => {
    const token = createOwnerToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ storeId: 1, rating: 5 });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings - SYSTEM_ADMIN is rejected with 403 Forbidden', async () => {
    const token = createAdminToken();
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ storeId: 1, rating: 5 });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('PUT /ratings/:storeId - rejects invalid rating parameter', async () => {
    const token = createUserToken();
    const res = await request(app)
      .put('/api/v1/ratings/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 10 });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings/:id/reply - NORMAL_USER is rejected with 403 Forbidden', async () => {
    const token = createUserToken();
    const res = await request(app)
      .post('/api/v1/ratings/1/reply')
      .set('Authorization', `Bearer ${token}`)
      .send({ reply: 'Thank you for your feedback!' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /ratings/:id/reply - rejects empty reply message', async () => {
    const token = createOwnerToken();
    const res = await request(app)
      .post('/api/v1/ratings/1/reply')
      .set('Authorization', `Bearer ${token}`)
      .send({ reply: '' });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
  });
});
