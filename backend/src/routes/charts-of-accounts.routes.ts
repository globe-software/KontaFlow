import { FastifyInstance } from 'fastify';
import { chartsOfAccountsService } from '../services/charts-of-accounts.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateChartOfAccountsSchema,
  UpdateChartOfAccountsSchema,
  ListChartsOfAccountsQuerySchema,
  ChartOfAccountsParamsSchema,
} from '../validators/charts-of-accounts.schema';

/**
 * Routes for Charts of Accounts
 *
 * Base path: /api/charts-of-accounts
 */

export async function chartsOfAccountsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/charts-of-accounts
   * List charts of accounts with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListChartsOfAccountsQuerySchema.parse(request.query);
    const result = await chartsOfAccountsService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/charts-of-accounts/:id
   * Get a chart of accounts by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = ChartOfAccountsParamsSchema.parse(request.params);
    const chart = await chartsOfAccountsService.getById(id, request.user!.id);

    return reply.send({ data: chart });
  });

  /**
   * POST /api/charts-of-accounts
   * Create a new chart of accounts
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateChartOfAccountsSchema.parse(request.body);
    const chart = await chartsOfAccountsService.create(data, request.user!.id);

    return reply.code(201).send({
      data: chart,
      message: 'Chart of Accounts created successfully',
    });
  });

  /**
   * PUT /api/charts-of-accounts/:id
   * Update a chart of accounts
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = ChartOfAccountsParamsSchema.parse(request.params);
    const data = UpdateChartOfAccountsSchema.parse(request.body);
    const chart = await chartsOfAccountsService.update(id, data, request.user!.id);

    return reply.send({
      data: chart,
      message: 'Chart of Accounts updated successfully',
    });
  });

  /**
   * DELETE /api/charts-of-accounts/:id
   * Delete a chart of accounts (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = ChartOfAccountsParamsSchema.parse(request.params);
    const result = await chartsOfAccountsService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
