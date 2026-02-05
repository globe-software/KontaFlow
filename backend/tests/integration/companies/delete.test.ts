import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCompany } from '../../factories/company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('DELETE /api/companies/:id', () => {

  describe('Happy Paths', () => {
    it('should soft delete a company', async () => {
      const server = getTestServer();

      // Create group and company first
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });

      expect(createResponse.statusCode).toBe(201);
      const company = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('successfully');

      // Verify it's soft deleted (should be marked as inactive)
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
      });
      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.active).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent company', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/companies/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject invalid ID format', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/companies/invalid',
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
        url: '/api/companies/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
