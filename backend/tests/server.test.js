const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/manga/search requires query', async () => {
    const res = await request(app).get('/api/manga/search');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/manga/search returns results', async () => {
    const res = await request(app).get('/api/manga/search?q=naruto');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('results');
  });

  test('GET /api/library returns array', async () => {
    const res = await request(app).get('/api/library');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('library');
  });
});
