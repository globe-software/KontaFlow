import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccount } from '../../factories/account.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';
import { AccountType, Currency } from '@prisma/client';

describe('POST /api/accounts', () => {

  describe('Happy Paths', () => {
    it('should create an account with all fields', async () => {
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

      const accountData = buildAccount({ chartOfAccountsId: chart.id });

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: accountData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      expect(body.data).toMatchObject({
        code: accountData.code,
        name: accountData.name,
        type: accountData.type,
        level: accountData.level,
        chartOfAccountsId: chart.id,
      });
      expect(body.data.id).toBeDefined();
      expect(body.message).toBe('Account created successfully');
    });

    it('should create an account with minimal fields', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const accountData = {
        chartOfAccountsId: chart.id,
        code: '2',
        name: 'Test Account Minimal',
        type: AccountType.INCOME,
        level: 1,
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: accountData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(accountData.name);
    });

    it('should create an account with parent', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      // Create parent account first
      const parentResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          code: '3',
          level: 1,
          postable: false,
        }),
      });
      const parent = JSON.parse(parentResponse.body).data;

      // Create child account
      const childResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          code: '3.1',
          level: 2,
          parentAccountId: parent.id,
        }),
      });

      expect(childResponse.statusCode).toBe(201);
      const childBody = JSON.parse(childResponse.body);
      expect(childBody.data.parentAccountId).toBe(parent.id);
    });
  });

  describe('Validations', () => {
    it('should reject account with short name', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          name: 'AB',
        }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject account with invalid code format', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          code: 'ABC', // Must be numbers and dots only
        }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject account with non-existent chart', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: 99999 }),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject account with level < 1', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          level: 0,
        }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate code within same chart', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const accountData = buildAccount({
        chartOfAccountsId: chart.id,
        code: '41',
      });

      // Create first account
      await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: accountData,
      });

      // Try to create duplicate
      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: accountData,
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(body.error.rule).toBe('DUPLICATE_CODE');
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        payload: buildAccount(),
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
