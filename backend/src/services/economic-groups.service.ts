import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type { CreateEconomicGroupDto, UpdateEconomicGroupDto, ListEconomicGroupsQuery } from '../validators/economic-groups.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Economic Groups
 *
 * Contains all business logic related to economic groups.
 */

export class EconomicGroupsService {
  /**
   * List economic groups
   */
  async list(filters: ListEconomicGroupsQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_groups',
      userId,
      filters,
    });

    // TODO: Filter only groups the user has access to
    // For now we return all
    return await economicGroupsRepository.findMany(filters);
  }

  /**
   * Get a group by ID
   */
  async getById(groupId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_group',
      groupId,
      userId,
    });

    // Verify that the group exists
    const group = await economicGroupsRepository.findById(groupId);

    if (!group) {
      throw new NotFoundError('Economic Group', groupId);
    }

    // Verify that the user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(groupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    return group;
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_user_groups',
      userId,
    });

    return await economicGroupsRepository.findByUserId(userId);
  }

  /**
   * Create a new economic group
   */
  async create(data: CreateEconomicGroupDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_group',
      userId,
      name: data.name,
    });

    // Additional business validations
    await this.validateGroupData(data);

    // Create group
    const group = await economicGroupsRepository.create(data, userId);

    logger.info({
      type: 'service',
      action: 'group_created',
      groupId: group!.id,
      userId,
    });

    return group;
  }

  /**
   * Update an economic group
   */
  async update(groupId: number, data: UpdateEconomicGroupDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_group',
      groupId,
      userId,
    });

    // Verify it exists
    const exists = await economicGroupsRepository.exists(groupId);
    if (!exists) {
      throw new NotFoundError('Economic Group', groupId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(groupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Business validations
    if (data.name || data.mainCountry || data.baseCurrency) {
      await this.validateGroupData(data as CreateEconomicGroupDto);
    }

    // Update
    const group = await economicGroupsRepository.update(groupId, data);

    logger.info({
      type: 'service',
      action: 'group_updated',
      groupId,
      userId,
    });

    return group;
  }

  /**
   * Delete an economic group (soft delete)
   */
  async delete(groupId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_group',
      groupId,
      userId,
    });

    // Verify it exists
    const group = await economicGroupsRepository.findById(groupId);
    if (!group) {
      throw new NotFoundError('Economic Group', groupId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(groupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Validate there are no active companies
    if (group.companies && group.companies.some((c: { active: boolean }) => c.active)) {
      throw new BusinessRuleError(
        'Cannot delete a group with active companies. Deactivate companies first.',
        'ACTIVE_COMPANIES'
      );
    }

    // Soft delete
    await economicGroupsRepository.delete(groupId);

    logger.info({
      type: 'service',
      action: 'group_deleted',
      groupId,
      userId,
    });

    return { success: true, message: 'Economic group deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateGroupData(data: Partial<CreateEconomicGroupDto>) {
    // Validate that the name is not empty (Zod already does this, but for safety)
    if (data.name && data.name.trim().length < 3) {
      throw new BusinessRuleError('Name must be at least 3 characters');
    }

    // Additional validations based on country
    if (data.mainCountry === 'UY' && data.baseCurrency) {
      if (!['UYU', 'USD'].includes(data.baseCurrency)) {
        throw new BusinessRuleError(
          'For Uruguay, the base currency must be UYU or USD',
          'INVALID_CURRENCY_FOR_COUNTRY'
        );
      }
    }

    // TODO: Add more business validations as required
  }
}

// Export singleton instance
export const economicGroupsService = new EconomicGroupsService();
