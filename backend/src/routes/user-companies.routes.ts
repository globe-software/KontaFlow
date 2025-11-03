import { FastifyInstance } from 'fastify';
import { userCompaniesService } from '../services/user-companies.service';
import { authenticateUser } from '../middleware/auth';
import {
  CreateUserCompanySchema,
  UpdateUserCompanySchema,
  UserCompanyParamsSchema,
  SingleIdParamSchema,
} from '../validators/user-companies.schema';

/**
 * Routes for User-Company permissions
 *
 * Base path: /api/user-companies
 */

export async function userCompaniesRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this module
  fastify.addHook('preHandler', authenticateUser);

  /**
   * GET /api/user-companies/by-user/:id
   * Get all companies for a user
   */
  fastify.get('/by-user/:id', async (request, reply) => {
    const { id: userId } = SingleIdParamSchema.parse(request.params);
    const companies = await userCompaniesService.getCompaniesByUser(userId, request.user!.id);

    return reply.send({ data: companies });
  });

  /**
   * GET /api/user-companies/by-company/:id
   * Get all users for a company
   */
  fastify.get('/by-company/:id', async (request, reply) => {
    const { id: companyId } = SingleIdParamSchema.parse(request.params);
    const users = await userCompaniesService.getUsersByCompany(companyId, request.user!.id);

    return reply.send({ data: users });
  });

  /**
   * GET /api/user-companies/:userId/:companyId
   * Get a specific user-company permission
   */
  fastify.get('/:userId/:companyId', async (request, reply) => {
    const { userId, companyId } = UserCompanyParamsSchema.parse(request.params);
    const permission = await userCompaniesService.getByUserAndCompany(
      userId,
      companyId,
      request.user!.id
    );

    return reply.send({ data: permission });
  });

  /**
   * POST /api/user-companies
   * Grant company access to a user
   */
  fastify.post('/', async (request, reply) => {
    const data = CreateUserCompanySchema.parse(request.body);
    const permission = await userCompaniesService.create(data, request.user!.id);

    return reply.code(201).send({
      data: permission,
      message: 'Company access granted successfully',
    });
  });

  /**
   * PUT /api/user-companies/:userId/:companyId
   * Update user-company permissions
   */
  fastify.put('/:userId/:companyId', async (request, reply) => {
    const { userId, companyId } = UserCompanyParamsSchema.parse(request.params);
    const data = UpdateUserCompanySchema.parse(request.body);
    const permission = await userCompaniesService.update(userId, companyId, data, request.user!.id);

    return reply.send({
      data: permission,
      message: 'Company permissions updated successfully',
    });
  });

  /**
   * DELETE /api/user-companies/:userId/:companyId
   * Revoke company access from a user
   */
  fastify.delete('/:userId/:companyId', async (request, reply) => {
    const { userId, companyId } = UserCompanyParamsSchema.parse(request.params);
    const result = await userCompaniesService.delete(userId, companyId, request.user!.id);

    return reply.send(result);
  });
}
