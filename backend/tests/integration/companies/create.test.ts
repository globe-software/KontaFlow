import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCompany } from '../../factories/company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('POST /api/companies', () => {

  describe('Happy Paths', () => {
    it('should create a company with all fields', async () => {
      const server = getTestServer();

      // Create a group first
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyData = buildCompany({ economicGroupId: group.id });

      const response = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: companyData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      expect(body.data).toMatchObject({
        name: companyData.name,
        tradeName: companyData.tradeName,
        rut: companyData.rut,
        country: companyData.country,
        functionalCurrency: companyData.functionalCurrency,
        economicGroupId: group.id,
      });
      expect(body.data.id).toBeDefined();
      expect(body.message).toBe('Company created successfully');
    });

    it('should create a company with USD currency', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyData = buildCompany({
        economicGroupId: group.id,
        functionalCurrency: 'USD',
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: companyData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.functionalCurrency).toBe('USD');
    });

    it('should create a company without optional fields', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const companyData = {
        economicGroupId: group.id,
        name: 'Test Company Minimal',
        rut: '217890120019',
        country: 'UY',
        functionalCurrency: 'UYU',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: companyData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(companyData.name);
    });
  });

  describe('Validations', () => {
    it('should reject company with short name', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({
          economicGroupId: group.id,
          name: 'AB',
        }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject company with invalid country', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: {
          ...buildCompany({ economicGroupId: group.id }),
          country: 'XX',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject company with invalid currency', async () => {
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
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: {
          ...buildCompany({ economicGroupId: group.id }),
          functionalCurrency: 'XXX',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject company with non-existent economic group', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: 99999 }),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/companies',
        payload: buildCompany(),
      });

      expect(response.statusCode).toBe(401);
    });
  });
});