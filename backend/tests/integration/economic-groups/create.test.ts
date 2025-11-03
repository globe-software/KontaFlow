import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('POST /api/economic-groups', () => {

  describe('Happy Paths', () => {
    it('should create a new economic group', async () => {
      const server = getTestServer();
      const newGroup = buildEconomicGroup({ name: 'New Test Group' });

      const response = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: newGroup,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toMatchObject({
        name: 'New Test Group',
        mainCountry: newGroup.mainCountry,
        baseCurrency: newGroup.baseCurrency,
        active: true,
      });
      expect(body.data.id).toBeDefined();
      expect(body.message).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should reject empty name', async () => {
      const server = getTestServer();
      const invalidGroup = buildEconomicGroup({ name: '' });

      const response = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: invalidGroup,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid country', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: {
          name: 'Test',
          mainCountry: 'INVALID',
          baseCurrency: 'UYU',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid currency', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: {
          name: 'Test',
          mainCountry: 'UY',
          baseCurrency: 'INVALID',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        payload: buildEconomicGroup(),
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
