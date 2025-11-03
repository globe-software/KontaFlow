import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('PUT /api/economic-groups/:id', () => {

  describe('Happy Paths', () => {
    it('should update an economic group', async () => {
      const server = getTestServer();

      // First create a group
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const groupId = JSON.parse(createResponse.body).data.id;

      // Then update it
      const response = await server.inject({
        method: 'PUT',
        url: `/api/economic-groups/${groupId}`,
        headers: { 'x-user-id': '1' },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('Updated Name');
      expect(body.message).toBeDefined();
    });

    it('should update only specified fields', async () => {
      const server = getTestServer();

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup({ mainCountry: 'UY', baseCurrency: 'UYU' }),
      });
      const groupId = JSON.parse(createResponse.body).data.id;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/economic-groups/${groupId}`,
        headers: { 'x-user-id': '1' },
        payload: {
          baseCurrency: 'USD',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.baseCurrency).toBe('USD');
      expect(body.data.mainCountry).toBe('UY');
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent group', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/economic-groups/99999',
        headers: { 'x-user-id': '1' },
        payload: { name: 'Updated' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/economic-groups/1',
        payload: { name: 'Updated' },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
