import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCompany } from '../../factories/company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('PUT /api/companies/:id', () => {

  describe('Happy Paths', () => {
    it('should update a company', async () => {
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

      const updateData = {
        name: 'Updated Company Name',
        tradeName: 'Updated Trade Name',
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.tradeName).toBe(updateData.tradeName);
      expect(body.message).toBe('Company updated successfully');
    });

    it('should update only provided fields', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
        payload: { tradeName: 'New Trade Name Only' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.tradeName).toBe('New Trade Name Only');
      expect(body.data.name).toBe(company.name); // Original name unchanged
    });

    it('should deactivate a company', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
        payload: { active: false },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.active).toBe(false);
    });
  });

  describe('Validations', () => {
    it('should reject update with invalid name', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/companies/${company.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'AB' }, // Too short
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent company', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/companies/99999',
        headers: { 'x-user-id': '1' },
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/companies/1',
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
