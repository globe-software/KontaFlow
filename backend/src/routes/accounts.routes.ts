import { FastifyInstance } from 'fastify';
import { accountsService } from '../services/accounts.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  ListAccountsQuerySchema,
  AccountParamsSchema,
} from '../validators/accounts.schema';

/**
 * Routes for Accounts
 *
 * Base path: /api/accounts
 */

export async function accountsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/accounts
   * List accounts with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListAccountsQuerySchema.parse(request.query);
    const result = await accountsService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/accounts/tree/:chartId
   * Get hierarchical tree structure for a chart of accounts
   */
  fastify.get('/tree/:chartId', async (request, reply) => {
    const { chartId } = request.params as { chartId: string };
    const id = Number(chartId);

    if (isNaN(id)) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Chart of Accounts ID must be a valid number',
        },
      });
    }

    const tree = await accountsService.getTree(id, request.user!.id);

    return reply.send({ data: tree });
  });

  /**
   * GET /api/accounts/by-chart/:chartId
   * Get all accounts for a chart of accounts (flat list)
   */
  fastify.get('/by-chart/:chartId', async (request, reply) => {
    const { chartId } = request.params as { chartId: string };
    const id = Number(chartId);

    if (isNaN(id)) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Chart of Accounts ID must be a valid number',
        },
      });
    }

    const accounts = await accountsService.getByChartOfAccounts(id, request.user!.id);

    return reply.send({ data: accounts });
  });

  /**
   * GET /api/accounts/:id
   * Get an account by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = AccountParamsSchema.parse(request.params);
    const account = await accountsService.getById(id, request.user!.id);

    return reply.send({ data: account });
  });

  /**
   * POST /api/accounts
   * Create a new account
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateAccountSchema.parse(request.body);
    const account = await accountsService.create(data, request.user!.id);

    return reply.code(201).send({
      data: account,
      message: 'Account created successfully',
    });
  });

  /**
   * PUT /api/accounts/:id
   * Update an account
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = AccountParamsSchema.parse(request.params);
    const data = UpdateAccountSchema.parse(request.body);
    const account = await accountsService.update(id, data, request.user!.id);

    return reply.send({
      data: account,
      message: 'Account updated successfully',
    });
  });

  /**
   * DELETE /api/accounts/:id
   * Delete an account (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = AccountParamsSchema.parse(request.params);
    const result = await accountsService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
