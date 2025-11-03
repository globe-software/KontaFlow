import { chartsOfAccountsRepository } from '../repositories/charts-of-accounts.repository';
import type { CreateChartOfAccountsDto, UpdateChartOfAccountsDto, ListChartsOfAccountsQuery } from '../validators/charts-of-accounts.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError, ConflictError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Charts of Accounts
 *
 * Contains all business logic related to charts of accounts.
 */

export class ChartsOfAccountsService {
  /**
   * List charts of accounts
   */
  async list(filters: ListChartsOfAccountsQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_charts_of_accounts',
      userId,
      filters,
    });

    // TODO: Filter only charts the user has access to via economic groups

    return await chartsOfAccountsRepository.findMany(filters);
  }

  /**
   * Get a chart of accounts by ID
   */
  async getById(chartId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_chart_of_accounts',
      chartId,
      userId,
    });

    const chart = await chartsOfAccountsRepository.findById(chartId);

    if (!chart) {
      throw new NotFoundError('Chart of Accounts', chartId);
    }

    // TODO: Verify user has access to the economic group

    return chart;
  }

  /**
   * Get chart of accounts by economic group ID
   */
  async getByEconomicGroupId(economicGroupId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_chart_by_group',
      economicGroupId,
      userId,
    });

    const chart = await chartsOfAccountsRepository.findByEconomicGroupId(economicGroupId);

    if (!chart) {
      throw new NotFoundError('Chart of Accounts for this Economic Group');
    }

    // TODO: Verify user has access to the economic group

    return chart;
  }

  /**
   * Create a new chart of accounts
   */
  async create(data: CreateChartOfAccountsDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_chart_of_accounts',
      userId,
      economicGroupId: data.economicGroupId,
      name: data.name,
    });

    // Verify economic group exists
    const groupExists = await chartsOfAccountsRepository.economicGroupExists(data.economicGroupId);
    if (!groupExists) {
      throw new NotFoundError('Economic Group', data.economicGroupId);
    }

    // Verify economic group doesn't already have a chart of accounts
    const existingChart = await chartsOfAccountsRepository.findByEconomicGroupId(data.economicGroupId);
    if (existingChart) {
      throw new ConflictError(
        'Economic Group already has a Chart of Accounts',
        'economicGroupId'
      );
    }

    // TODO: Verify user is ADMIN of the economic group

    // Create chart
    const chart = await chartsOfAccountsRepository.create(data);

    logger.info({
      type: 'service',
      action: 'chart_of_accounts_created',
      chartId: chart.id,
      economicGroupId: data.economicGroupId,
      userId,
    });

    return chart;
  }

  /**
   * Update a chart of accounts
   */
  async update(chartId: number, data: UpdateChartOfAccountsDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_chart_of_accounts',
      chartId,
      userId,
    });

    // Verify it exists
    const chart = await chartsOfAccountsRepository.findById(chartId);
    if (!chart) {
      throw new NotFoundError('Chart of Accounts', chartId);
    }

    // TODO: Verify user is ADMIN of the economic group

    // Update chart
    const updatedChart = await chartsOfAccountsRepository.update(chartId, data);

    logger.info({
      type: 'service',
      action: 'chart_of_accounts_updated',
      chartId,
      userId,
    });

    return updatedChart;
  }

  /**
   * Delete a chart of accounts (soft delete)
   */
  async delete(chartId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_chart_of_accounts',
      chartId,
      userId,
    });

    // Verify it exists
    const chart = await chartsOfAccountsRepository.findById(chartId);
    if (!chart) {
      throw new NotFoundError('Chart of Accounts', chartId);
    }

    // TODO: Verify user is ADMIN of the economic group

    // Business rule: Cannot delete chart if it has accounts
    const accountCount = await chartsOfAccountsRepository.countAccounts(chartId);
    if (accountCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete Chart of Accounts with ${accountCount} account(s). Delete all accounts first.`,
        'HAS_ACCOUNTS'
      );
    }

    // Soft delete
    await chartsOfAccountsRepository.delete(chartId);

    logger.info({
      type: 'service',
      action: 'chart_of_accounts_deleted',
      chartId,
      userId,
    });

    return { success: true, message: 'Chart of Accounts deleted successfully' };
  }
}

// Export singleton instance
export const chartsOfAccountsService = new ChartsOfAccountsService();
