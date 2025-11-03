import { accountingPeriodsRepository } from '../repositories/accounting-periods.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type {
  CreateAccountingPeriodDto,
  UpdateAccountingPeriodDto,
  ListAccountingPeriodsQuery,
} from '../validators/accounting-periods.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';
import { PeriodType } from '@prisma/client';

/**
 * Service for Accounting Periods
 *
 * Contains all business logic related to fiscal years and monthly periods.
 * Manages period closing and ensures accounting integrity.
 */

export class AccountingPeriodsService {
  /**
   * List accounting periods with filters and pagination
   */
  async list(filters: ListAccountingPeriodsQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_accounting_periods',
      userId,
      filters,
    });

    // TODO: Filter only periods for economic groups the user has access to
    // For now we return all
    return await accountingPeriodsRepository.findMany(filters);
  }

  /**
   * Get a period by ID
   */
  async getById(periodId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_accounting_period',
      periodId,
      userId,
    });

    // Verify that the period exists
    const period = await accountingPeriodsRepository.findById(periodId);

    if (!period) {
      throw new NotFoundError('Accounting Period', periodId);
    }

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(period.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this accounting period');
    }

    return period;
  }

  /**
   * Get all periods for an economic group
   */
  async getByEconomicGroup(economicGroupId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_periods_by_group',
      economicGroupId,
      userId,
    });

    // Verify the economic group exists
    const groupExists = await economicGroupsRepository.exists(economicGroupId);

    if (!groupExists) {
      throw new NotFoundError('Economic Group', economicGroupId);
    }

    // Verify user has access to the group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    return await accountingPeriodsRepository.findByEconomicGroup(economicGroupId);
  }

  /**
   * Create a new accounting period
   */
  async create(data: CreateAccountingPeriodDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_accounting_period',
      userId,
      economicGroupId: data.economicGroupId,
      periodType: data.type,
      fiscalYear: data.fiscalYear,
      month: data.month,
    });

    // Verify the economic group exists
    const groupExists = await economicGroupsRepository.exists(data.economicGroupId);

    if (!groupExists) {
      throw new NotFoundError('Economic Group', data.economicGroupId);
    }

    // Verify user has access to the group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(data.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    // Business validations
    await this.validatePeriodData(data);

    // Check for duplicate period combination (same type, year, month)
    const combinationExists = await accountingPeriodsRepository.periodCombinationExists(
      data.economicGroupId,
      data.type,
      data.fiscalYear,
      data.month
    );

    if (combinationExists) {
      const periodDesc =
        data.type === PeriodType.FISCAL_YEAR
          ? `Fiscal Year ${data.fiscalYear}`
          : `${data.fiscalYear}-${data.month}`;

      throw new BusinessRuleError(
        `An accounting period for ${periodDesc} already exists in this economic group`,
        'DUPLICATE_PERIOD'
      );
    }

    // Check for overlapping periods (same type, overlapping dates)
    const hasOverlap = await accountingPeriodsRepository.checkOverlap(
      data.economicGroupId,
      data.type,
      data.fiscalYear,
      data.startDate,
      data.endDate,
      data.month
    );

    if (hasOverlap) {
      throw new BusinessRuleError(
        'The date range overlaps with an existing accounting period',
        'OVERLAPPING_PERIOD'
      );
    }

    // Create period
    const period = await accountingPeriodsRepository.create(data);

    logger.info({
      type: 'service',
      action: 'accounting_period_created',
      periodId: period.id,
      userId,
    });

    return period;
  }

  /**
   * Update a period
   * Only for admin use - generally periods should not be updated after creation
   */
  async update(periodId: number, data: UpdateAccountingPeriodDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_accounting_period',
      periodId,
      userId,
    });

    // Verify it exists
    const period = await accountingPeriodsRepository.findById(periodId);

    if (!period) {
      throw new NotFoundError('Accounting Period', periodId);
    }

    // Verify user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(period.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this accounting period');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Update
    const updatedPeriod = await accountingPeriodsRepository.update(periodId, data);

    logger.info({
      type: 'service',
      action: 'accounting_period_updated',
      periodId,
      userId,
    });

    return updatedPeriod;
  }

  /**
   * Close an accounting period
   * Only ADMIN can close periods
   * Cannot close if has DRAFT or PENDING_APPROVAL entries
   */
  async closePeriod(periodId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'close_accounting_period',
      periodId,
      userId,
    });

    // Verify it exists
    const period = await accountingPeriodsRepository.findById(periodId);

    if (!period) {
      throw new NotFoundError('Accounting Period', periodId);
    }

    // Verify user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(period.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this accounting period');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Check if already closed
    if (period.closed) {
      throw new BusinessRuleError('This period is already closed', 'ALREADY_CLOSED');
    }

    // Check if period is closable (no DRAFT or PENDING_APPROVAL entries)
    const closableCheck = await accountingPeriodsRepository.isClosable(periodId);

    if (!closableCheck.closable) {
      throw new BusinessRuleError(
        `Cannot close period: ${closableCheck.reason}. Found ${closableCheck.count} problematic entries.`,
        'PERIOD_NOT_CLOSABLE'
      );
    }

    // Close the period
    const closedPeriod = await accountingPeriodsRepository.closePeriod(periodId, userId);

    logger.info({
      type: 'service',
      action: 'accounting_period_closed',
      periodId,
      userId,
    });

    return closedPeriod;
  }

  /**
   * Reopen an accounting period
   * Only ADMIN can reopen periods
   */
  async reopenPeriod(periodId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'reopen_accounting_period',
      periodId,
      userId,
    });

    // Verify it exists
    const period = await accountingPeriodsRepository.findById(periodId);

    if (!period) {
      throw new NotFoundError('Accounting Period', periodId);
    }

    // Verify user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(period.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this accounting period');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Check if already open
    if (!period.closed) {
      throw new BusinessRuleError('This period is already open', 'ALREADY_OPEN');
    }

    // Reopen the period
    const reopenedPeriod = await accountingPeriodsRepository.reopenPeriod(periodId);

    logger.info({
      type: 'service',
      action: 'accounting_period_reopened',
      periodId,
      userId,
    });

    return reopenedPeriod;
  }

  /**
   * Delete an accounting period
   * Only allowed if no journal entries exist in the period
   */
  async delete(periodId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_accounting_period',
      periodId,
      userId,
    });

    // Verify it exists
    const period = await accountingPeriodsRepository.findById(periodId);

    if (!period) {
      throw new NotFoundError('Accounting Period', periodId);
    }

    // Verify user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(period.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this accounting period');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Validate there are no journal entries in the period
    const entryCount = await accountingPeriodsRepository.countJournalEntries(periodId);

    if (entryCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete period with ${entryCount} journal entries.`,
        'HAS_JOURNAL_ENTRIES'
      );
    }

    // Delete
    await accountingPeriodsRepository.delete(periodId);

    logger.info({
      type: 'service',
      action: 'accounting_period_deleted',
      periodId,
      userId,
    });

    return { success: true, message: 'Accounting period deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validatePeriodData(data: CreateAccountingPeriodDto) {
    // Validate FISCAL_YEAR type should not have month
    if (data.type === PeriodType.FISCAL_YEAR && data.month) {
      throw new BusinessRuleError(
        'FISCAL_YEAR type periods should not have a month',
        'INVALID_FISCAL_YEAR_MONTH'
      );
    }

    // Validate MONTH type must have month (1-12)
    if (data.type === PeriodType.MONTH) {
      if (!data.month) {
        throw new BusinessRuleError('MONTH type periods must have a month (1-12)', 'MISSING_MONTH');
      }

      if (data.month < 1 || data.month > 12) {
        throw new BusinessRuleError('Month must be between 1 and 12', 'INVALID_MONTH');
      }
    }

    // Validate startDate < endDate (already done in schema, but for safety)
    if (data.startDate >= data.endDate) {
      throw new BusinessRuleError('Start date must be before end date', 'INVALID_DATE_RANGE');
    }

    // Validate dates are within the fiscal year
    const startYear = data.startDate.getFullYear();
    const endYear = data.endDate.getFullYear();

    // Allow periods to span year boundaries, but warn if too far
    if (Math.abs(endYear - startYear) > 1) {
      logger.warn({
        type: 'validation',
        message: 'Period spans more than one calendar year',
        startDate: data.startDate,
        endDate: data.endDate,
      });
    }

    // TODO: Add more business validations as required
  }
}

// Export singleton instance
export const accountingPeriodsService = new AccountingPeriodsService();
