import { FastifyInstance } from 'fastify';
import { customersService } from '../services/customers.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  ListCustomersQuerySchema,
  CustomerParamsSchema,
} from '../validators/customers.schema';

/**
 * Routes for Customers
 *
 * Base path: /api/customers
 */

export async function customersRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/customers
   * List customers with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListCustomersQuerySchema.parse(request.query);
    const result = await customersService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/customers/:id
   * Get a customer by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = CustomerParamsSchema.parse(request.params);
    const customer = await customersService.getById(id, request.user!.id);

    return reply.send({ data: customer });
  });

  /**
   * POST /api/customers
   * Create a new customer
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateCustomerSchema.parse(request.body);
    const customer = await customersService.create(data, request.user!.id);

    return reply.code(201).send({
      data: customer,
      message: 'Customer created successfully',
    });
  });

  /**
   * PUT /api/customers/:id
   * Update a customer
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = CustomerParamsSchema.parse(request.params);
    const data = UpdateCustomerSchema.parse(request.body);
    const customer = await customersService.update(id, data, request.user!.id);

    return reply.send({
      data: customer,
      message: 'Customer updated successfully',
    });
  });

  /**
   * DELETE /api/customers/:id
   * Delete a customer (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = CustomerParamsSchema.parse(request.params);
    const result = await customersService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
