import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCompany } from '../../factories/company.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('GET /api/companies', () => {

  describe('Happy Paths', () => {
    it('should list all companies with default pagination', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should respect pagination limit', async () => {
      const server = getTestServer();

      // Create a group first
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      // Create some companies to test pagination
      await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });
      await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies?limit=2',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.limit).toBe(2);
    });

    it('should filter by economic group', async () => {
      const server = getTestServer();

      // Create a specific group
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      // Create a company in that group
      await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({ economicGroupId: group.id }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/companies?economicGroupId=${group.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((c: any) => c.economicGroupId === group.id)).toBe(true);
    });

    it('should filter by country', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies?country=UY',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((c: any) => c.country === 'UY')).toBe(true);
    });

    it('should search by name or RUT', async () => {
      const server = getTestServer();

      // Create a group and company with searchable name
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      const searchName = 'SearchableCompany';
      await server.inject({
        method: 'POST',
        url: '/api/companies',
        headers: { 'x-user-id': '1' },
        payload: buildCompany({
          economicGroupId: group.id,
          name: searchName,
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/companies?search=${searchName}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((c: any) =>
        c.name.includes(searchName)
      )).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no results match filter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies?search=NonExistentCompany123456',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(0);
      expect(body.pagination.total).toBe(0);
    });

    it('should validate page parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies?page=0',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate limit parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies?limit=200',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/companies',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});