import { accountsRepository } from '../repositories/accounts.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import { prisma } from '../lib/prisma';
import type { CreateAccountDto, UpdateAccountDto, ListAccountsQuery } from '../validators/accounts.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';
import { AccountType } from '@prisma/client';

/**
 * Service for Accounts
 *
 * Contains all business logic related to chart of accounts.
 * Implements double-entry accounting rules for account hierarchy.
 */

export class AccountsService {
  /**
   * List accounts with filters and pagination
   */
  async list(filters: ListAccountsQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_accounts',
      userId,
      filters,
    });

    // TODO: Filter only accounts the user has access to via economic groups
    // For now we return all
    return await accountsRepository.findMany(filters);
  }

  /**
   * Get an account by ID
   */
  async getById(accountId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_account',
      accountId,
      userId,
    });

    // Verify that the account exists
    const account = await accountsRepository.findById(accountId);

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(
      account.chartOfAccounts.economicGroupId,
      userId
    );

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this account');
    }

    return account;
  }

  /**
   * Get all accounts for a chart of accounts (flat list)
   */
  async getByChartOfAccounts(chartId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_accounts_by_chart',
      chartId,
      userId,
    });

    // Verify chart exists and get economic group
    const chart = await prisma.chartOfAccounts.findUnique({
      where: { id: chartId },
      select: { economicGroupId: true },
    });

    if (!chart) {
      throw new NotFoundError('Chart of Accounts', chartId);
    }

    // Verify user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(chart.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this chart of accounts');
    }

    return await accountsRepository.findByChartOfAccounts(chartId);
  }

  /**
   * Get hierarchical tree structure for a chart of accounts
   */
  async getTree(chartId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_account_tree',
      chartId,
      userId,
    });

    // Verify chart exists and get economic group
    const chart = await prisma.chartOfAccounts.findUnique({
      where: { id: chartId },
      select: { economicGroupId: true },
    });

    if (!chart) {
      throw new NotFoundError('Chart of Accounts', chartId);
    }

    // Verify user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(chart.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this chart of accounts');
    }

    return await accountsRepository.findTree(chartId);
  }

  /**
   * Create a new account
   */
  async create(data: CreateAccountDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_account',
      userId,
      code: data.code,
      chartId: data.chartOfAccountsId,
    });

    // Verify chart exists and get economic group
    const chart = await prisma.chartOfAccounts.findUnique({
      where: { id: data.chartOfAccountsId },
      select: { id: true, economicGroupId: true },
    });

    if (!chart) {
      throw new NotFoundError('Chart of Accounts', data.chartOfAccountsId);
    }

    // Verify user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(chart.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this chart of accounts');
    }

    // Business validations
    await this.validateAccountData(data);

    // Check for duplicate code in chart
    const codeExists = await accountsRepository.codeExistsInChart(data.code, data.chartOfAccountsId);

    if (codeExists) {
      throw new BusinessRuleError(
        `An account with code ${data.code} already exists in this chart of accounts`,
        'DUPLICATE_CODE'
      );
    }

    // If has parent, validate parent exists and level is correct
    if (data.parentAccountId) {
      const parent = await accountsRepository.findById(data.parentAccountId);

      if (!parent) {
        throw new NotFoundError('Parent Account', data.parentAccountId);
      }

      // Validate parent is in same chart
      if (parent.chartOfAccountsId !== data.chartOfAccountsId) {
        throw new BusinessRuleError(
          'Parent account must be in the same chart of accounts',
          'INVALID_PARENT_CHART'
        );
      }

      // Validate level is parent.level + 1
      const hierarchyValidation = await accountsRepository.validateHierarchy(
        data.parentAccountId,
        data.level
      );

      if (!hierarchyValidation.valid) {
        throw new BusinessRuleError(
          `Account level must be ${hierarchyValidation.parentLevel! + 1} (parent level + 1)`,
          'INVALID_LEVEL'
        );
      }
    } else {
      // Root accounts should be level 1
      if (data.level !== 1) {
        throw new BusinessRuleError('Root accounts must have level 1', 'INVALID_ROOT_LEVEL');
      }
    }

    // Create account
    const account = await accountsRepository.create(data);

    logger.info({
      type: 'service',
      action: 'account_created',
      accountId: account.id,
      userId,
    });

    return account;
  }

  /**
   * Update an account
   */
  async update(accountId: number, data: UpdateAccountDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_account',
      accountId,
      userId,
    });

    // Verify it exists
    const account = await accountsRepository.findById(accountId);

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    // Verify user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(
      account.chartOfAccounts.economicGroupId,
      userId
    );

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this account');
    }

    // Business validations for updates
    if (data.code || data.name || data.type || data.nature) {
      await this.validateAccountData(data as CreateAccountDto);
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== account.code) {
      const codeExists = await accountsRepository.codeExistsInChart(
        data.code,
        account.chartOfAccountsId,
        accountId
      );

      if (codeExists) {
        throw new BusinessRuleError(
          `An account with code ${data.code} already exists in this chart of accounts`,
          'DUPLICATE_CODE'
        );
      }
    }

    // If setting postable to true, validate no subaccounts exist
    if (data.postable === true) {
      const subaccountCount = await accountsRepository.countSubaccounts(accountId);

      if (subaccountCount > 0) {
        throw new BusinessRuleError(
          'Cannot set account as postable because it has subaccounts',
          'HAS_SUBACCOUNTS'
        );
      }
    }

    // If updating parent or level, validate hierarchy
    if (data.parentAccountId !== undefined || data.level !== undefined) {
      const newParentId = data.parentAccountId !== undefined ? data.parentAccountId : account.parentAccountId;
      const newLevel = data.level !== undefined ? data.level : account.level;

      if (newParentId) {
        const hierarchyValidation = await accountsRepository.validateHierarchy(newParentId, newLevel);

        if (!hierarchyValidation.valid) {
          throw new BusinessRuleError(
            `Account level must be ${hierarchyValidation.parentLevel! + 1} (parent level + 1)`,
            'INVALID_LEVEL'
          );
        }
      } else {
        // Root accounts should be level 1
        if (newLevel !== 1) {
          throw new BusinessRuleError('Root accounts must have level 1', 'INVALID_ROOT_LEVEL');
        }
      }
    }

    // Update
    const updatedAccount = await accountsRepository.update(accountId, data);

    logger.info({
      type: 'service',
      action: 'account_updated',
      accountId,
      userId,
    });

    return updatedAccount;
  }

  /**
   * Delete an account (soft delete)
   */
  async delete(accountId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_account',
      accountId,
      userId,
    });

    // Verify it exists
    const account = await accountsRepository.findById(accountId);

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    // Verify user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(
      account.chartOfAccounts.economicGroupId,
      userId
    );

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this account');
    }

    // Validate there are no journal entry lines
    const entryLineCount = await accountsRepository.countJournalEntryLines(accountId);

    if (entryLineCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete account with ${entryLineCount} journal entry lines. You can deactivate it instead.`,
        'HAS_JOURNAL_ENTRIES'
      );
    }

    // Validate there are no subaccounts
    const subaccountCount = await accountsRepository.countSubaccounts(accountId);

    if (subaccountCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete account with ${subaccountCount} subaccounts. Delete or reassign subaccounts first.`,
        'HAS_SUBACCOUNTS'
      );
    }

    // Soft delete
    await accountsRepository.delete(accountId);

    logger.info({
      type: 'service',
      action: 'account_deleted',
      accountId,
      userId,
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateAccountData(data: Partial<CreateAccountDto>) {
    // Validate that the name is not empty (Zod already does this, but for safety)
    if (data.name && data.name.trim().length < 3) {
      throw new BusinessRuleError('Name must be at least 3 characters');
    }

    // Validate code format (only numbers and dots)
    if (data.code && !/^[0-9.]+$/.test(data.code)) {
      throw new BusinessRuleError('Code must contain only numbers and dots', 'INVALID_CODE_FORMAT');
    }

    // Validate requiresAuxiliary and auxiliaryType are consistent
    if (data.requiresAuxiliary === true && !data.auxiliaryType) {
      throw new BusinessRuleError(
        'Auxiliary type must be specified when account requires auxiliary',
        'MISSING_AUXILIARY_TYPE'
      );
    }

    // Validate ASSET/LIABILITY accounts should have nature
    if (data.type && (data.type === AccountType.ASSET || data.type === AccountType.LIABILITY)) {
      if (!data.nature) {
        throw new BusinessRuleError(
          'Asset and Liability accounts should have nature (CURRENT or NON_CURRENT)',
          'MISSING_NATURE'
        );
      }
    }

    // TODO: Add more business validations as required
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
