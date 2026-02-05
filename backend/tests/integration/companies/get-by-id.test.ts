import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCompany } from '../../factories/company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/companies/:id', () => {

  describe('Happy Paths', () => {
    it('should get a company by ID', async () => {
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
      const company = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'GET',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toMatchObject({
        id: company.id,
        name: company.name,
        rut: company.rut,
        country: company.country,
        functionalCurrency: company.functionalCurrency,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent company', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies/99999',
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
        url: '/api/companies/invalid',
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
        url: '/api/companies/1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
