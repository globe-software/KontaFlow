import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';

describe('GET /api/economic-groups/:id', () => {

  describe('Happy Paths', () => {
    it('should get a group by ID', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups/1',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toMatchObject({
        id: 1,
        name: expect.any(String),
        mainCountry: expect.any(String),
        baseCurrency: expect.any(String),
      });
      expect(body.data.companies).toBeDefined();
      expect(body.data.chartOfAccounts).toBeDefined();
      expect(body.data.configuration).toBeDefined();
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent group', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should validate ID parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups/invalid',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
