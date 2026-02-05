import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('PUT /api/charts-of-accounts/:id', () => {

  describe('Happy Paths', () => {
    it('should update a chart', async () => {
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

      const updateData = {
        name: 'Updated Chart Name',
        description: 'Updated description',
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/api/charts-of-accounts/${chart.id}`,
        headers: { 'x-user-id': '1' },
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.description).toBe(updateData.description);
      expect(body.message).toBe('Chart of Accounts updated successfully');
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

      const response = await server.inject({
        method: 'PUT',
        url: `/api/charts-of-accounts/${chart.id}`,
        headers: { 'x-user-id': '1' },
        payload: { description: 'New description only' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.description).toBe('New description only');
      expect(body.data.name).toBe(chart.name); // Original name unchanged
    });

    it('should deactivate a chart', async () => {
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
        method: 'PUT',
        url: `/api/charts-of-accounts/${chart.id}`,
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
      const chart = group.chartOfAccounts;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/charts-of-accounts/${chart.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'AB' }, // Too short
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should return 404 for non-existent chart', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'PUT',
        url: '/api/charts-of-accounts/99999',
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
        url: '/api/charts-of-accounts/1',
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
