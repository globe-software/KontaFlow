import { FastifyInstance } from 'fastify';
import { currenciesService } from '../services/currencies.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateCurrencySchema,
  UpdateCurrencySchema,
  ListCurrenciesQuerySchema,
  CurrencyParamsSchema,
} from '../validators/currencies.schema';

/**
 * Routes for Currencies
 *
 * Base path: /api/currencies
 */

export async function currenciesRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/currencies
   * List all currencies with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListCurrenciesQuerySchema.parse(request.query);
    const result = await currenciesService.list(filters);

    return reply.send(result);
  });

  /**
   * GET /api/currencies/active
   * Get all active currencies (for dropdowns)
   */
  fastify.get('/active', async (request, reply) => {
    const currencies = await currenciesService.getAllActive();

    return reply.send({
      data: currencies,
      message: 'Active currencies retrieved successfully',
    });
  });

  /**
   * GET /api/currencies/:code
   * Get a specific currency by code
   */
  fastify.get('/:code', async (request, reply) => {
    const { code } = CurrencyParamsSchema.parse(request.params);
    const currency = await currenciesService.getByCode(code);

    return reply.send({
      data: currency,
      message: 'Currency retrieved successfully',
    });
  });

  /**
   * POST /api/currencies
   * Create a new currency
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateCurrencySchema.parse(request.body);
    const currency = await currenciesService.create(data);

    return reply.code(201).send({
      data: currency,
      message: 'Currency created successfully',
    });
  });

  /**
   * PUT /api/currencies/:code
   * Update a currency
   */
  fastify.put('/:code', async (request, reply) => {
    const { code } = CurrencyParamsSchema.parse(request.params);
    const data = UpdateCurrencySchema.parse(request.body);
    const currency = await currenciesService.update(code, data);

    return reply.send({
      data: currency,
      message: 'Currency updated successfully',
    });
  });

  /**
   * DELETE /api/currencies/:code
   * Delete a currency
   */
  fastify.delete('/:code', async (request, reply) => {
    const { code } = CurrencyParamsSchema.parse(request.params);
    const result = await currenciesService.delete(code);

    return reply.send(result);
  });
}
