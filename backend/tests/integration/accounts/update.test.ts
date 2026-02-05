import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccount } from '../../factories/account.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';
import { AccountType } from '@prisma/client';

describe('PUT /api/accounts/:id', () => {

  describe('Happy Paths', () => {
    it('should update an account', async () => {
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

      // Create an account
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const updateData = {
        name: 'Updated Account Name',
        postable: false,
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.postable).toBe(updateData.postable);
      expect(body.message).toBe('Account updated successfully');
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
      const chart = group.chartOfAccounts;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'New name only' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('New name only');
      expect(body.data.code).toBe(account.code); // Original code unchanged
    });

    it('should deactivate an account', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: { active: false },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.active).toBe(false);
    });

    it('should update account type', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({
          chartOfAccountsId: chart.id,
          type: AccountType.INCOME,
          nature: null, // INCOME accounts don't require nature
        }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: { type: AccountType.EXPENSE },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.type).toBe(AccountType.EXPENSE);
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
      const chart = group.chartOfAccounts;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'AB' }, // Too short
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update with invalid code format', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;
      const chart = group.chartOfAccounts;

      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/accounts',
        headers: { 'x-user-id': '1' },
        payload: buildAccount({ chartOfAccountsId: chart.id }),
      });
      const account = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/accounts/${account.id}`,
        headers: { 'x-user-id': '1' },
        payload: { code: 'ABC' }, // Must be numbers and dots
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent account', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/accounts/99999',
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
        url: '/api/accounts/1',
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
