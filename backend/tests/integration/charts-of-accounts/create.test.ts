import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildChartOfAccounts } from '../../factories/chart-of-accounts.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('POST /api/charts-of-accounts', () => {

  describe('Business Rules', () => {
    it('should reject creating a chart for a group that already has one', async () => {
      const server = getTestServer();

      // Create a group (which auto-creates a chart)
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      // Verify the chart was auto-created
      expect(group.chartOfAccounts).toBeDefined();
      expect(group.chartOfAccounts.economicGroupId).toBe(group.id);

      // Try to create another chart for the same group
      const response = await server.inject({
        method: 'POST',
        url: '/api/charts-of-accounts',
        headers: { 'x-user-id': '1' },
        payload: buildChartOfAccounts({ economicGroupId: group.id }),
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('CONFLICT');
      expect(body.error.message).toContain('already has a Chart of Accounts');
    });
  });

  describe('Validations', () => {
    it('should reject chart with short name', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const response = await server.inject({
        method: 'POST',
        url: '/api/charts-of-accounts',
        headers: { 'x-user-id': '1' },
        payload: buildChartOfAccounts({
          economicGroupId: group.id,
          name: 'AB',
        }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject chart with non-existent economic group', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/charts-of-accounts',
        headers: { 'x-user-id': '1' },
        payload: buildChartOfAccounts({ economicGroupId: 99999 }),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/charts-of-accounts',
        payload: buildChartOfAccounts(),
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
