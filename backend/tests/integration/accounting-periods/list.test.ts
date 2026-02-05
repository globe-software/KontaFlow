import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildAccountingPeriod } from '../../factories/accounting-period.factory';
import { buildEconomicGroup } from '../../factories/economic-group.factory';
import { PeriodType } from '@prisma/client';

describe('GET /api/accounting-periods', () => {

  describe('Happy Paths', () => {
    it('should list all periods with default pagination', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounting-periods',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 100,
      });
    });

    it('should filter by economic group', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      await server.inject({
        method: 'POST',
        url: '/api/accounting-periods',
        headers: { 'x-user-id': '1' },
        payload: buildAccountingPeriod({ economicGroupId: group.id }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounting-periods?economicGroupId=${group.id}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.every((p: any) => p.economicGroupId === group.id)).toBe(true);
    });

    it('should filter by type', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      await server.inject({
        method: 'POST',
        url: '/api/accounting-periods',
        headers: { 'x-user-id': '1' },
        payload: buildAccountingPeriod({
          economicGroupId: group.id,
          type: PeriodType.MONTH,
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/accounting-periods?type=${PeriodType.MONTH}`,
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((p: any) => p.type === PeriodType.MONTH)).toBe(true);
    });

    it('should filter by fiscal year', async () => {
      const server = getTestServer();

      const groupResponse = await server.inject({
        method: 'POST',
        url: '/api/economic-groups',
        headers: { 'x-user-id': '1' },
        payload: buildEconomicGroup(),
      });
      const group = JSON.parse(groupResponse.body).data;

      await server.inject({
        method: 'POST',
        url: '/api/accounting-periods',
        headers: { 'x-user-id': '1' },
        payload: buildAccountingPeriod({
          economicGroupId: group.id,
          fiscalYear: 2023,
        }),
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounting-periods?fiscalYear=2023',
        headers: { 'x-user-id': '1' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((p: any) => p.fiscalYear === 2023)).toBe(true);
    });
  });

  describe('Auth', () => {
    it('should require authentication', async () => {
      const server = getTestServer();

      const response = await server.inject({
        method: 'GET',
        url: '/api/accounting-periods',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
