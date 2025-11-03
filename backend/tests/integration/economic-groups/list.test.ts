import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/economic-groups', () => {

  describe('Happy Paths', () => {
    it('should list all groups with default pagination', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should respect pagination limit', async () => {
      const server = getTestServer();

      // Create some additional groups to test pagination
      await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?limit=2',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.limit).toBe(2);
    });

    it('should filter by country', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?mainCountry=UY',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((g: any) => g.mainCountry === 'UY')).toBe(true);
    });

    it('should search by name', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?search=Pragmatic',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((g: any) => g.name.includes('Pragmatic'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no results match filter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?search=NonExistentGroup123456',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(0);
      expect(body.pagination.total).toBe(0);
    });

    it('should validate page parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?page=0',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate limit parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/economic-groups?limit=200',
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
        url: '/api/economic-groups',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
