import { FastifyInstance } from 'fastify';
import { economicGroupsService } from '../services/economic-groups.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateEconomicGroupSchema,
  UpdateEconomicGroupSchema,
  ListEconomicGroupsQuerySchema,
  EconomicGroupParamsSchema,
} from '../validators/economic-groups.schema';

/**
 * Routes for Economic Groups
 *
 * Base path: /api/economic-groups
 */

export async function economicGroupsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/economic-groups
   * List economic groups with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListEconomicGroupsQuerySchema.parse(request.query);
    const result = await economicGroupsService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/economic-groups/my-groups
   * Get authenticated user's groups
   */
  fastify.get('/my-groups', async (request, reply) => {
    const groups = await economicGroupsService.getUserGroups(request.user!.id);

    return reply.send({ data: groups });
  });

  /**
   * GET /api/economic-groups/:id
   * Get an economic group by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = EconomicGroupParamsSchema.parse(request.params);
    const group = await economicGroupsService.getById(id, request.user!.id);

    return reply.send({ data: group });
  });

  /**
   * POST /api/economic-groups
   * Create a new economic group
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateEconomicGroupSchema.parse(request.body);
    const group = await economicGroupsService.create(data, request.user!.id);

    return reply.code(201).send({
      data: group,
      message: 'Economic group created successfully',
    });
  });

  /**
   * PUT /api/economic-groups/:id
   * Update an economic group
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = EconomicGroupParamsSchema.parse(request.params);
    const data = UpdateEconomicGroupSchema.parse(request.body);
    const group = await economicGroupsService.update(id, data, request.user!.id);

    return reply.send({
      data: group,
      message: 'Economic group updated successfully',
    });
  });

  /**
   * DELETE /api/economic-groups/:id
   * Delete an economic group (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = EconomicGroupParamsSchema.parse(request.params);
    const result = await economicGroupsService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
