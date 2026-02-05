import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/charts-of-accounts', () => {

  describe('Happy Paths', () => {
    it('should list all charts with default pagination', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts',
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

      // Create some groups to test pagination (each auto-creates a chart)
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
        url: '/api/charts-of-accounts?limit=2',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.limit).toBe(2);
    });

    it('should filter by economic group', async () => {
      const server = getTestServer();

      // Create a specific group (which auto-creates a chart)
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const response = await server.inject({
        method: 'GET',
        url: `/api/charts-of-accounts?economicGroupId=${group.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((c: any) => c.economicGroupId === group.id)).toBe(true);
    });

    it('should search by name', async () => {
      const server = getTestServer();

      // Create a group with a unique searchable name
      const uniqueName = `SearchableGroup-${Date.now()}`;
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup({ name: uniqueName }),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Update the chart name to make it more searchable
      await server.inject({
        method: 'PUT',
        url: `/api/charts-of-accounts/${chart.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: `SearchableChart-${Date.now()}` },
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/charts-of-accounts?search=SearchableChart`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((c: any) => c.name.includes('SearchableChart'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no results match filter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts?search=NonExistentChart123456',
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
        url: '/api/charts-of-accounts?page=0',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate limit parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts?limit=200',
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
        url: '/api/charts-of-accounts',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
