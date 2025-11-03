import { userCompaniesRepository } from '../repositories/user-companies.repository';
import type { CreateUserCompanyDto, UpdateUserCompanyDto } from '../validators/user-companies.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError, ConflictError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for User-Company permissions
 *
 * Contains all business logic related to user-company access control.
 */

export class UserCompaniesService {
  /**
   * Get all companies for a user
   */
  async getCompaniesByUser(userId: number, requestingUserId: number) {
    logger.debug({
      type: 'service',
      action: 'get_user_companies',
      userId,
      requestingUserId,
    });

    // Verify user exists
    const userExists = await userCompaniesRepository.userExists(userId);
    if (!userExists) {
      throw new NotFoundError('User', userId);
    }

    // TODO: Verify requesting user has permission to view this information
    // For now, users can only see their own companies unless they're admin

    return await userCompaniesRepository.findCompaniesByUserId(userId);
  }

  /**
   * Get all users for a company
   */
  async getUsersByCompany(companyId: number, requestingUserId: number) {
    logger.debug({
      type: 'service',
      action: 'get_company_users',
      companyId,
      requestingUserId,
    });

    // Verify company exists
    const companyExists = await userCompaniesRepository.companyExists(companyId);
    if (!companyExists) {
      throw new NotFoundError('Company', companyId);
    }

    // TODO: Verify requesting user has access to this company
    // For now, only admins can see this

    return await userCompaniesRepository.findUsersByCompanyId(companyId);
  }

  /**
   * Get a specific user-company permission
   */
  async getByUserAndCompany(userId: number, companyId: number, requestingUserId: number) {
    logger.debug({
      type: 'service',
      action: 'get_user_company_permission',
      userId,
      companyId,
      requestingUserId,
    });

    const permission = await userCompaniesRepository.findByUserAndCompany(userId, companyId);

    if (!permission) {
      throw new NotFoundError('User-Company permission');
    }

    // TODO: Verify requesting user has permission to view this

    return permission;
  }

  /**
   * Grant company access to a user
   */
  async create(data: CreateUserCompanyDto, requestingUserId: number) {
    logger.info({
      type: 'service',
      action: 'grant_company_access',
      userId: data.userId,
      companyId: data.companyId,
      canWrite: data.canWrite,
      requestingUserId,
    });

    // Verify user exists
    const userExists = await userCompaniesRepository.userExists(data.userId);
    if (!userExists) {
      throw new NotFoundError('User', data.userId);
    }

    // Verify company exists
    const companyExists = await userCompaniesRepository.companyExists(data.companyId);
    if (!companyExists) {
      throw new NotFoundError('Company', data.companyId);
    }

    // Verify permission doesn't already exist
    const existingPermission = await userCompaniesRepository.findByUserAndCompany(
      data.userId,
      data.companyId
    );

    if (existingPermission) {
      throw new ConflictError(
        'User already has access to this company. Use update to modify permissions.',
        'userId_companyId'
      );
    }

    // TODO: Verify requesting user is admin of the economic group

    // Create permission
    const permission = await userCompaniesRepository.create(data);

    logger.info({
      type: 'service',
      action: 'company_access_granted',
      userId: data.userId,
      companyId: data.companyId,
      requestingUserId,
    });

    return permission;
  }

  /**
   * Update user-company permissions
   */
  async update(userId: number, companyId: number, data: UpdateUserCompanyDto, requestingUserId: number) {
    logger.info({
      type: 'service',
      action: 'update_company_permission',
      userId,
      companyId,
      requestingUserId,
    });

    // Verify permission exists
    const existingPermission = await userCompaniesRepository.findByUserAndCompany(userId, companyId);
    if (!existingPermission) {
      throw new NotFoundError('User-Company permission');
    }

    // TODO: Verify requesting user is admin of the economic group

    // Update permission
    const permission = await userCompaniesRepository.update(userId, companyId, data);

    logger.info({
      type: 'service',
      action: 'company_permission_updated',
      userId,
      companyId,
      canWrite: data.canWrite,
      requestingUserId,
    });

    return permission;
  }

  /**
   * Revoke company access from a user
   */
  async delete(userId: number, companyId: number, requestingUserId: number) {
    logger.warn({
      type: 'service',
      action: 'revoke_company_access',
      userId,
      companyId,
      requestingUserId,
    });

    // Verify permission exists
    const existingPermission = await userCompaniesRepository.findByUserAndCompany(userId, companyId);
    if (!existingPermission) {
      throw new NotFoundError('User-Company permission');
    }

    // TODO: Verify requesting user is admin of the economic group

    // Prevent revoking if user has active journal entries for this company
    // This is a business rule to maintain audit trail integrity
    // TODO: Implement this check when journal entries module is ready

    // Delete permission
    await userCompaniesRepository.delete(userId, companyId);

    logger.info({
      type: 'service',
      action: 'company_access_revoked',
      userId,
      companyId,
      requestingUserId,
    });

    return { success: true, message: 'Company access revoked successfully' };
  }

  /**
   * Check if user has access to company
   */
  async verifyAccess(userId: number, companyId: number): Promise<boolean> {
    return await userCompaniesRepository.hasAccess(userId, companyId);
  }

  /**
   * Check if user has write access to company
   */
  async verifyWriteAccess(userId: number, companyId: number): Promise<boolean> {
    return await userCompaniesRepository.hasWriteAccess(userId, companyId);
  }
}

// Export singleton instance
export const userCompaniesService = new UserCompaniesService();
