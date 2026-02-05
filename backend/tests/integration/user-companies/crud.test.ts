import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildUserCompany } from '../../factories/user-company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';
import { buildCompany } from '../../factories/company.factory';

describe('User Companies CRUD', () => {
  describe('POST /api/user-companies', () => {
    it('should grant company access to user', async () => {
      const server = getTestServer();

      // Create group and company
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyResponse = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(companyResponse.body).data;

      const response = await server.inject({
        method: 'POST',
        url: '/api/user-companies',
        headers: { 'x-user-id': '1' },
        payload: buildUserCompany({ userId: 2, companyId: company.id }),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.userId).toBe(2);
      expect(body.data.companyId).toBe(company.id);
    });

    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/user-companies',
        payload: buildUserCompany(),
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/user-companies/by-user/:id', () => {
    it('should list companies for a user', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/user-companies/by-user/1',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/user-companies/:userId/:companyId', () => {
    it('should update permissions', async () => {
      const server = getTestServer();

      // Create group and company
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyResponse = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(companyResponse.body).data;

      // Grant access
      await server.inject({
        method: 'POST',
        url: '/api/user-companies',
        headers: { 'x-user-id': '1' },
        payload: buildUserCompany({ userId: 2, companyId: company.id, canWrite: false }),
      });

      // Update permissions
      const response = await server.inject({
        method: 'PUT',
        url: `/api/user-companies/2/${company.id}`,
        headers: { 'x-user-id': '1' },
        payload: { canWrite: true },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.canWrite).toBe(true);
    });
  });

  describe('DELETE /api/user-companies/:userId/:companyId', () => {
    it('should revoke company access', async () => {
      const server = getTestServer();

      // Create group and company
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyResponse = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      const company = JSON.parse(companyResponse.body).data;

      // Grant access
      await server.inject({
        method: 'POST',
        url: '/api/user-companies',
        headers: { 'x-user-id': '1' },
        payload: buildUserCompany({ userId: 2, companyId: company.id }),
      });

      // Revoke access
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/user-companies/2/${company.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
