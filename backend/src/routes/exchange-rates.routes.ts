import { FastifyInstance } from 'fastify';
import { exchangeRatesService } from '../services/exchange-rates.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateExchangeRateSchema,
  UpdateExchangeRateSchema,
  ListExchangeRatesQuerySchema,
  ExchangeRateParamsSchema,
} from '../validators/exchange-rates.schema';

/**
 * Routes for Exchange Rates
 *
 * Base path: /api/exchange-rates
 */

export async function exchangeRatesRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/exchange-rates
   * List exchange rates with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListExchangeRatesQuerySchema.parse(request.query);
    const result = await exchangeRatesService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/exchange-rates/:id
   * Get an exchange rate by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = ExchangeRateParamsSchema.parse(request.params);
    const rate = await exchangeRatesService.getById(id, request.user!.id);

    return reply.send({ data: rate });
  });

  /**
   * POST /api/exchange-rates
   * Create a new exchange rate
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateExchangeRateSchema.parse(request.body);
    const rate = await exchangeRatesService.create(data, request.user!.id);

    return reply.code(201).send({
      data: rate,
      message: 'Exchange rate created successfully',
    });
  });

  /**
   * PUT /api/exchange-rates/:id
   * Update an exchange rate
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = ExchangeRateParamsSchema.parse(request.params);
    const data = UpdateExchangeRateSchema.parse(request.body);
    const rate = await exchangeRatesService.update(id, data, request.user!.id);

    return reply.send({
      data: rate,
      message: 'Exchange rate updated successfully',
    });
  });

  /**
   * DELETE /api/exchange-rates/:id
   * Delete an exchange rate (hard delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = ExchangeRateParamsSchema.parse(request.params);
    const result = await exchangeRatesService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
