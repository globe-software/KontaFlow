import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccountingPeriod } from '../../factories/accounting-period.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/accounting-periods/:id', () => {

  describe('Happy Paths', () => {
    it('should get a period by ID', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounting-periods',
        headers: { 'x-user-id': '1' },
        payload: buildAccountingPeriod({ economicGroupId: group.id }),
      });
      const period = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounting-periods/${period.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toMatchObject({
        id: period.id,
        fiscalYear: period.fiscalYear,
        economicGroupId: group.id,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent period', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounting-periods/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject invalid ID format', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounting-periods/invalid',
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
        url: '/api/accounting-periods/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
