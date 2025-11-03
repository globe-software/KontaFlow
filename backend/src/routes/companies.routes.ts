import { FastifyInstance } from 'fastify';
import { companiesService } from '../services/companies.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateCompanySchema,
  UpdateCompanySchema,
  ListCompaniesQuerySchema,
  CompanyParamsSchema,
} from '../validators/companies.schema';

/**
 * Routes for Companies
 *
 * Base path: /api/companies
 */

export async function companiesRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/companies
   * List companies with pagination and filters
   */
  fastify.get('/', async (request, reply) => {
    const filters = ListCompaniesQuerySchema.parse(request.query);
    const result = await companiesService.list(filters, request.user!.id);

    return reply.send(result);
  });

  /**
   * GET /api/companies/by-group/:economicGroupId
   * Get companies by economic group
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

    const companies = await companiesService.getByEconomicGroup(groupId, request.user!.id);

    return reply.send({ data: companies });
  });

  /**
   * GET /api/companies/:id
   * Get a company by ID
   */
  fastify.get('/:id', async (request, reply) => {
    const { id } = CompanyParamsSchema.parse(request.params);
    const company = await companiesService.getById(id, request.user!.id);

    return reply.send({ data: company });
  });

  /**
   * POST /api/companies
   * Create a new company
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateCompanySchema.parse(request.body);
    const company = await companiesService.create(data, request.user!.id);

    return reply.code(201).send({
      data: company,
      message: 'Company created successfully',
    });
  });

  /**
   * PUT /api/companies/:id
   * Update a company
   */
  fastify.put('/:id', async (request, reply) => {
    const { id } = CompanyParamsSchema.parse(request.params);
    const data = UpdateCompanySchema.parse(request.body);
    const company = await companiesService.update(id, data, request.user!.id);

    return reply.send({
      data: company,
      message: 'Company updated successfully',
    });
  });

  /**
   * DELETE /api/companies/:id
   * Delete a company (soft delete)
   */
  fastify.delete('/:id', async (request, reply) => {
    const { id } = CompanyParamsSchema.parse(request.params);
    const result = await companiesService.delete(id, request.user!.id);

    return reply.send(result);
  });
}
