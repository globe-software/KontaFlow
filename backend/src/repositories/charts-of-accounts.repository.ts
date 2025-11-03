import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateChartOfAccountsDto, UpdateChartOfAccountsDto, ListChartsOfAccountsQuery } from '../validators/charts-of-accounts.schema';

/**
 * Repository for Charts of Accounts
 *
 * Responsible for all database operations
 * related to charts of accounts.
 */

export class ChartsOfAccountsRepository {
  /**
   * List charts of accounts with pagination and filters
   */
  async findMany(filters: ListChartsOfAccountsQuery) {
    const { page, limit, search, active, economicGroupId } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.ChartOfAccountsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (economicGroupId) {
      where.economicGroupId = economicGroupId;
    }

    // Execute query with pagination
    const [charts, total] = await Promise.all([
      prisma.chartOfAccounts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          economicGroupId: true,
          name: true,
          description: true,
          active: true,
          createdAt: true,
          economicGroup: {
            select: {
              id: true,
              name: true,
              mainCountry: true,
              baseCurrency: true,
            },
          },
          _count: {
            select: {
              accounts: true,
            },
          },
        },
      }),
      prisma.chartOfAccounts.count({ where }),
    ]);

    return {
      data: charts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a chart of accounts by ID
   */
  async findById(id: number) {
    return await prisma.chartOfAccounts.findUnique({
      where: { id },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            mainCountry: true,
            baseCurrency: true,
            active: true,
          },
        },
        accounts: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            level: true,
            active: true,
          },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  /**
   * Find chart of accounts by economic group ID
   */
  async findByEconomicGroupId(economicGroupId: number) {
    return await prisma.chartOfAccounts.findUnique({
      where: { economicGroupId },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            mainCountry: true,
            baseCurrency: true,
          },
        },
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });
  }

  /**
   * Create a new chart of accounts
   */
  async create(data: CreateChartOfAccountsDto) {
    return await prisma.chartOfAccounts.create({
      data: {
        economicGroupId: data.economicGroupId,
        name: data.name,
        description: data.description,
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update a chart of accounts
   */
  async update(id: number, data: UpdateChartOfAccountsDto) {
    return await prisma.chartOfAccounts.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a chart of accounts (soft delete)
   */
  async delete(id: number) {
    return await prisma.chartOfAccounts.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Count accounts in a chart
   */
  async countAccounts(chartId: number): Promise<number> {
    return await prisma.account.count({
      where: { chartOfAccountsId: chartId },
    });
  }

  /**
   * Verify if a chart of accounts exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.chartOfAccounts.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Verify if economic group exists
   */
  async economicGroupExists(economicGroupId: number): Promise<boolean> {
    const count = await prisma.economicGroup.count({
      where: { id: economicGroupId },
    });

    return count > 0;
  }
}

// Export singleton instance
export const chartsOfAccountsRepository = new ChartsOfAccountsRepository();
