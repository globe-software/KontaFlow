import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/charts-of-accounts/:id', () => {

  describe('Happy Paths', () => {
    it('should get a chart by ID', async () => {
      const server = getTestServer();

      // Create a group (which auto-creates a chart)
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const response = await server.inject({
        method: 'GET',
        url: `/api/charts-of-accounts/${chart.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toMatchObject({
        id: chart.id,
        name: chart.name,
        economicGroupId: group.id,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent chart', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should reject invalid ID format', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts/invalid',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/charts-of-accounts/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
