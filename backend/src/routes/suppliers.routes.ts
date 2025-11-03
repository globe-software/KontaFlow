import { FastifyInstance } from 'fastify';
import { suppliersService } from '../services/suppliers.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  ListSuppliersQuerySchema,
  SupplierParamsSchema,
} from '../validators/suppliers.schema';

/**
 * Routes for Suppliers
 *
 * Base path: /api/suppliers
 */

export async function suppliersRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/suppliers
   * List suppliers with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListSuppliersQuerySchema.parse(request.query);
    const result = await suppliersService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/suppliers/:id
   * Get a supplier by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = SupplierParamsSchema.parse(request.params);
    const supplier = await suppliersService.getById(id, request.user!.id);

    return reply.send({ data: supplier });
  });

  /**
   * POST /api/suppliers
   * Create a new supplier
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateSupplierSchema.parse(request.body);
    const supplier = await suppliersService.create(data, request.user!.id);

    return reply.code(201).send({
      data: supplier,
      message: 'Supplier created successfully',
    });
  });

  /**
   * PUT /api/suppliers/:id
   * Update a supplier
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = SupplierParamsSchema.parse(request.params);
    const data = UpdateSupplierSchema.parse(request.body);
    const supplier = await suppliersService.update(id, data, request.user!.id);

    return reply.send({
      data: supplier,
      message: 'Supplier updated successfully',
    });
  });

  /**
   * DELETE /api/suppliers/:id
   * Delete a supplier (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = SupplierParamsSchema.parse(request.params);
    const result = await suppliersService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
