import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildSupplier } from '../../factories/supplier.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';

describe('Suppliers CRUD', () => {
  describe('POST /api/suppliers', () => {
    it('should create a supplier', async () => {
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
        url: '/api/suppliers',
        headers: { 'x-user-id': '1' },
        payload: buildSupplier({ economicGroupId: group.id }),
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
        url: '/api/suppliers',
        payload: buildSupplier(),
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/suppliers', () => {
    it('should list suppliers', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/suppliers',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });
  });

  describe('GET /api/suppliers/:id', () => {
    it('should get supplier by ID', async () => {
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
        url: '/api/suppliers',
        headers: { 'x-user-id': '1' },
        payload: buildSupplier({ economicGroupId: group.id }),
      });
      const supplier = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'GET',
        url: `/api/suppliers/${supplier.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(supplier.id);
    });

    it('should return 404 for non-existent supplier', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/suppliers/99999',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/suppliers/:id', () => {
    it('should update supplier', async () => {
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
        url: '/api/suppliers',
        headers: { 'x-user-id': '1' },
        payload: buildSupplier({ economicGroupId: group.id }),
      });
      const supplier = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'PUT',
        url: `/api/suppliers/${supplier.id}`,
        headers: { 'x-user-id': '1' },
        payload: { name: 'Updated Supplier Name' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('Updated Supplier Name');
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    it('should soft delete supplier', async () => {
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
        url: '/api/suppliers',
        headers: { 'x-user-id': '1' },
        payload: buildSupplier({ economicGroupId: group.id }),
      });
      const supplier = JSON.parse(createResponse.body).data;

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/suppliers/${supplier.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);

      // Verify soft delete
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/suppliers/${supplier.id}`,
        headers: { 'x-user-id': '1' },
      });
      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.active).toBe(false);
    });
  });
});
