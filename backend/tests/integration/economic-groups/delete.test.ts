import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('DELETE /api/economic-groups/:id', () => {

  describe('Happy Paths', () => {
    it('should soft delete an economic group', async () => {
      const server = getTestServer();

      // Create a group
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const groupId = JSON.parse(createResponse.body).data.id;

      // Delete it
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/economic-groups/${groupId}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Verify it's inactive
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/economic-groups/${groupId}`,
        headers: { 'x-user-id': '1' },
      });
      const group = JSON.parse(getResponse.body).data;
      expect(group.active).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent group', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/economic-groups/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/economic-groups/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
