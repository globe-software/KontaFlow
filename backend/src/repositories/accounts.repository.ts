import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateAccountDto, UpdateAccountDto, ListAccountsQuery } from '../validators/accounts.schema';

/**
 * Repository for Accounts
 *
 * Responsible for all database operations
 * related to chart of accounts and account hierarchy.
 */

export class AccountsRepository {
  /**
   * List accounts with pagination and filters
   * Supports hierarchical queries
   */
  async findMany(filters: ListAccountsQuery) {
    const { page, limit, search, chartOfAccountsId, type, level, postable, active, parentAccountId } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.AccountWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (chartOfAccountsId !== undefined) {
      where.chartOfAccountsId = chartOfAccountsId;
    }

    if (type) {
      where.type = type;
    }

    if (level !== undefined) {
      where.level = level;
    }

    if (postable !== undefined) {
      where.postable = postable;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (parentAccountId !== undefined) {
      where.parentAccountId = parentAccountId;
    }

    // Execute query with pagination
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        select: {
          id: true,
          chartOfAccountsId: true,
          code: true,
          name: true,
          parentAccountId: true,
          type: true,
          level: true,
          postable: true,
          requiresAuxiliary: true,
          auxiliaryType: true,
          currency: true,
          nature: true,
          ifrsCategory: true,
          active: true,
          parentAccount: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              subaccounts: true,
            },
          },
        },
      }),
      prisma.account.count({ where }),
    ]);

    return {
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find an account by ID
   * Includes parent and subaccounts
   */
  async findById(id: number) {
    return await prisma.account.findUnique({
      where: { id },
      include: {
        chartOfAccounts: {
          select: {
            id: true,
            name: true,
            economicGroupId: true,
          },
        },
        parentAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
        subaccounts: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
            postable: true,
            active: true,
          },
          orderBy: { code: 'asc' },
        },
        _count: {
          select: {
            subaccounts: true,
            entryLines: true,
          },
        },
      },
    });
  }

  /**
   * Find all accounts for a chart of accounts
   */
  async findByChartOfAccounts(chartId: number) {
    return await prisma.account.findMany({
      where: { chartOfAccountsId: chartId },
      select: {
        id: true,
        code: true,
        name: true,
        parentAccountId: true,
        type: true,
        level: true,
        postable: true,
        requiresAuxiliary: true,
        auxiliaryType: true,
        currency: true,
        nature: true,
        ifrsCategory: true,
        active: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get hierarchical tree structure for a chart of accounts
   */
  async findTree(chartId: number) {
    // First, get all accounts
    const allAccounts = await prisma.account.findMany({
      where: {
        chartOfAccountsId: chartId,
        active: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        parentAccountId: true,
        type: true,
        level: true,
        postable: true,
        requiresAuxiliary: true,
        auxiliaryType: true,
        currency: true,
        nature: true,
      },
      orderBy: { code: 'asc' },
    });

    // Build tree structure (root accounts are those without parent)
    const buildTree = (parentId: number | null): any[] => {
      return allAccounts
        .filter(acc => acc.parentAccountId === parentId)
        .map(acc => ({
          ...acc,
          subaccounts: buildTree(acc.id),
        }));
    };

    return buildTree(null);
  }

  /**
   * Create a new account
   * Validates code is unique in chart, validates parent exists if specified
   */
  async create(data: CreateAccountDto) {
    return await prisma.account.create({
      data: {
        chartOfAccountsId: data.chartOfAccountsId,
        code: data.code,
        name: data.name,
        parentAccountId: data.parentAccountId,
        type: data.type,
        level: data.level,
        postable: data.postable ?? true,
        requiresAuxiliary: data.requiresAuxiliary ?? false,
        auxiliaryType: data.auxiliaryType,
        currency: data.currency,
        nature: data.nature,
        ifrsCategory: data.ifrsCategory,
        valuationMethod: data.valuationMethod,
      },
      include: {
        chartOfAccounts: {
          select: {
            id: true,
            name: true,
          },
        },
        parentAccount: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update an account
   */
  async update(id: number, data: UpdateAccountDto) {
    return await prisma.account.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.parentAccountId !== undefined && { parentAccountId: data.parentAccountId }),
        ...(data.type && { type: data.type }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.postable !== undefined && { postable: data.postable }),
        ...(data.requiresAuxiliary !== undefined && { requiresAuxiliary: data.requiresAuxiliary }),
        ...(data.auxiliaryType !== undefined && { auxiliaryType: data.auxiliaryType }),
        ...(data.currency && { currency: data.currency }),
        ...(data.nature !== undefined && { nature: data.nature }),
        ...(data.ifrsCategory !== undefined && { ifrsCategory: data.ifrsCategory }),
        ...(data.valuationMethod !== undefined && { valuationMethod: data.valuationMethod }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: {
        chartOfAccounts: {
          select: {
            id: true,
            name: true,
          },
        },
        parentAccount: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete an account (soft delete)
   * Should check no journal entries exist
   */
  async delete(id: number) {
    return await prisma.account.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Verify if an account exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.account.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Verify if a code exists in a chart of accounts
   * Used for duplicate validation
   */
  async codeExistsInChart(code: string, chartId: number, excludeId?: number): Promise<boolean> {
    const where: Prisma.AccountWhereInput = {
      chartOfAccountsId: chartId,
      code,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.account.count({ where });

    return count > 0;
  }

  /**
   * Validate hierarchy: ensure level is parent.level + 1
   */
  async validateHierarchy(parentId: number, expectedLevel: number): Promise<{ valid: boolean; parentLevel?: number }> {
    const parent = await prisma.account.findUnique({
      where: { id: parentId },
      select: { level: true },
    });

    if (!parent) {
      return { valid: false };
    }

    const isValid = parent.level + 1 === expectedLevel;

    return {
      valid: isValid,
      parentLevel: parent.level,
    };
  }

  /**
   * Count journal entry lines for an account
   */
  async countJournalEntryLines(accountId: number): Promise<number> {
    return await prisma.entryLine.count({
      where: { accountId },
    });
  }

  /**
   * Count subaccounts for an account
   */
  async countSubaccounts(accountId: number): Promise<number> {
    return await prisma.account.count({
      where: { parentAccountId: accountId },
    });
  }

  /**
   * Get chart of accounts ID for an account
   */
  async getChartOfAccountsId(accountId: number): Promise<number | null> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { chartOfAccountsId: true },
    });

    return account?.chartOfAccountsId ?? null;
  }
}

// Export singleton instance
export const accountsRepository = new AccountsRepository();
