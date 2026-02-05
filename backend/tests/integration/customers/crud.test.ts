import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildCustomer } from '../../factories/customer.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('Customers CRUD', () => {
  describe('POST /api/customers', () => {
    it('should create a customer', async () => {
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
        url: '/api/customers',
        headers: { 'x-user-id': '1' },
        payload: buildCustomer({ economicGroupId: group.id }),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBeDefined();
      expect(body.message).toContain('successfully');
    });

    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'POST',
        url: '/api/customers',
        payload: buildCustomer(),
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/customers', () => {
    it('should list customers', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/customers',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get customer by ID', async () => {
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
        url: '/api/customers',
        headers: { 'x-user-id': '1' },
        payload: buildCustomer({ economicGroupId: group.id }),
      });
      const customer = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'GET',
        url: `/api/customers/${customer.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(customer.id);
    });

    it('should return 404 for non-existent customer', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/customers/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer', async () => {
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
        url: '/api/customers',
        headers: { 'x-user-id': '1' },
        payload: buildCustomer({ economicGroupId: group.id }),
      });
      const customer = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/customers/${customer.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'Updated Customer Name' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('Updated Customer Name');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should soft delete customer', async () => {
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
        url: '/api/customers',
        headers: { 'x-user-id': '1' },
        payload: buildCustomer({ economicGroupId: group.id }),
      });
      const customer = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/customers/${customer.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);

      // Verify soft delete
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/customers/${customer.id}`,
        headers: { 'x-user-id': '1' },
      });
      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.active).toBe(false);
    });
  });
});
