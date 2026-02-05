import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccount } from '../../factories/account.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';
import { AccountType } from '@prisma/client';

describe('GET /api/accounts', () => {

  describe('Happy Paths', () => {
    it('should list all accounts with default pagination', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 100,
      });
      expect(body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should respect pagination limit', async () => {
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

      // Create some accounts
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id, code: '1.1' }),
      });
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id, code: '1.2' }),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts?limit=2',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.limit).toBe(2);
    });

    it('should filter by chart of accounts', async () => {
      const server = getTestServer();

      // Create a specific group and chart
      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Create an account in that chart
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounts?chartOfAccountsId=${chart.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((a: any) => a.chartOfAccountsId === chart.id)).toBe(true);
    });

    it('should filter by account type', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Create an expense account
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          type: AccountType.EXPENSE,
          code: '5.1'
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounts?type=${AccountType.EXPENSE}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((a: any) => a.type === AccountType.EXPENSE)).toBe(true);
    });

    it('should filter by level', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Create a level 3 account
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          level: 3,
          code: '1.1.1'
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts?level=3',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((a: any) => a.level === 3)).toBe(true);
    });

    it('should filter by postable', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Create a non-postable account
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          postable: false,
          code: '1.0'
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts?postable=false',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((a: any) => a.postable === false)).toBe(true);
    });

    it('should search by name', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const searchName = `SearchableAccount-${Date.now()}`;
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          name: searchName,
          code: '9.99'
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounts?search=SearchableAccount`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((a: any) => a.name.includes('SearchableAccount'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no results match filter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts?search=NonExistentAccount123456',
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
        url: '/api/accounts?page=0',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate limit parameter', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounts?limit=1000',
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
        url: '/api/accounts',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
