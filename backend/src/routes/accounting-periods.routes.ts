import { FastifyInstance } from 'fastify';
import { accountingPeriodsService } from '../services/accounting-periods.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateAccountingPeriodSchema,
  UpdateAccountingPeriodSchema,
  ListAccountingPeriodsQuerySchema,
  AccountingPeriodParamsSchema,
} from '../validators/accounting-periods.schema';

/**
 * Routes for Accounting Periods
 *
 * Base path: /api/accounting-periods
 */

export async function accountingPeriodsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/accounting-periods
   * List accounting periods with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListAccountingPeriodsQuerySchema.parse(request.query);
    const result = await accountingPeriodsService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/accounting-periods/by-group/:economicGroupId
   * Get all periods for an economic group
   */
  fastify.get('/by-group/:economicGroupId', async (request, reply) => {
    const { economicGroupId } = request.params as { economicGroupId: string };
    const groupId = Number(economicGroupId);

    if (isNaN(groupId)) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Economic Group ID must be a valid number',
        },
      });
    }

    const periods = await accountingPeriodsService.getByEconomicGroup(groupId, request.user!.id);

    return reply.send({ data: periods });
  });

  /**
   * GET /api/accounting-periods/:id
   * Get a period by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = AccountingPeriodParamsSchema.parse(request.params);
    const period = await accountingPeriodsService.getById(id, request.user!.id);

    return reply.send({ data: period });
  });

  /**
   * POST /api/accounting-periods
   * Create a new accounting period
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateAccountingPeriodSchema.parse(request.body);
    const period = await accountingPeriodsService.create(data, request.user!.id);

    return reply.code(201).send({
      data: period,
      message: 'Accounting period created successfully',
    });
  });

  /**
   * PUT /api/accounting-periods/:id
   * Update an accounting period (admin only)
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = AccountingPeriodParamsSchema.parse(request.params);
    const data = UpdateAccountingPeriodSchema.parse(request.body);
    const period = await accountingPeriodsService.update(id, data, request.user!.id);

    return reply.send({
      data: period,
      message: 'Accounting period updated successfully',
    });
  });

  /**
   * POST /api/accounting-periods/:id/close
   * Close an accounting period
   */
  fastify.post('/:id/close', async (request, reply) => {
    const { id } = AccountingPeriodParamsSchema.parse(request.params);
    const period = await accountingPeriodsService.closePeriod(id, request.user!.id);

    return reply.send({
      data: period,
      message: 'Accounting period closed successfully',
    });
  });

  /**
   * POST /api/accounting-periods/:id/reopen
   * Reopen an accounting period
   */
  fastify.post('/:id/reopen', async (request, reply) => {
    const { id } = AccountingPeriodParamsSchema.parse(request.params);
    const period = await accountingPeriodsService.reopenPeriod(id, request.user!.id);

    return reply.send({
      data: period,
      message: 'Accounting period reopened successfully',
    });
  });

  /**
   * DELETE /api/accounting-periods/:id
   * Delete an accounting period
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = AccountingPeriodParamsSchema.parse(request.params);
    const result = await accountingPeriodsService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
