import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccount } from '../../factories/account.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('DELETE /api/accounts/:id', () => {

  describe('Happy Paths', () => {
    it('should soft delete an account', async () => {
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

      // Create an account
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('successfully');

      // Verify it's soft deleted (should be marked as inactive)
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
      });
      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.active).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent account', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/accounts/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject invalid ID format', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/accounts/invalid',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/accounts/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
