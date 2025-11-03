import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateEconomicGroupDto, UpdateEconomicGroupDto, ListEconomicGroupsQuery } from '../validators/economic-groups.schema';

/**
 * Repository for Economic Groups
 *
 * Responsible for all database operations
 * related to economic groups.
 */

export class EconomicGroupsRepository {
  /**
   * List economic groups with pagination and filters
   */
  async findMany(filters: ListEconomicGroupsQuery) {
    const { page, limit, search, active, mainCountry } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.EconomicGroupWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (mainCountry) {
      where.mainCountry = mainCountry;
    }

    // Execute query with pagination
    const [groups, total] = await Promise.all([
      prisma.economicGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          mainCountry: true,
          baseCurrency: true,
          createdAt: true,
          active: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
      }),
      prisma.economicGroup.count({ where }),
    ]);

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a group by ID
   */
  async findById(id: number) {
    return await prisma.economicGroup.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            rut: true,
            functionalCurrency: true,
            active: true,
          },
        },
        chartOfAccounts: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
        configuration: true,
      },
    });
  }

  /**
   * Find groups by user
   */
  async findByUserId(userId: number) {
    return await prisma.economicGroup.findMany({
      where: {
        userGroups: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        mainCountry: true,
        baseCurrency: true,
        active: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new economic group
   */
  async create(data: CreateEconomicGroupDto, createdByUserId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create economic group
      const group = await tx.economicGroup.create({
        data: {
          name: data.name,
          mainCountry: data.mainCountry,
          baseCurrency: data.baseCurrency,
        },
      });

      // 2. Assign the creator user as ADMIN of the group
      await tx.userGroup.create({
        data: {
          userId: createdByUserId,
          economicGroupId: group.id,
          role: 'ADMIN',
        },
      });

      // 3. Create default accounting configuration
      await tx.accountingConfiguration.create({
        data: {
          economicGroupId: group.id,
          allowEntriesInClosedPeriod: false,
          requireGlobalApproval: false,
          minimumApprovalAmount: 50000.00,
          allowUnbalancedEntries: false,
          amountDecimals: 2,
          exchangeRateDecimals: 4,
        },
      });

      // 4. Create empty chart of accounts
      await tx.chartOfAccounts.create({
        data: {
          economicGroupId: group.id,
          name: `Chart of Accounts - ${group.name}`,
          description: 'Default chart of accounts',
        },
      });

      // Return group with relations
      return await tx.economicGroup.findUnique({
        where: { id: group.id },
        include: {
          companies: true,
          chartOfAccounts: true,
          configuration: true,
        },
      });
    });
  }

  /**
   * Update an economic group
   */
  async update(id: number, data: UpdateEconomicGroupDto) {
    return await prisma.economicGroup.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.mainCountry && { mainCountry: data.mainCountry }),
        ...(data.baseCurrency && { baseCurrency: data.baseCurrency }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            rut: true,
            functionalCurrency: true,
            active: true,
          },
        },
        chartOfAccounts: true,
      },
    });
  }

  /**
   * Delete an economic group (soft delete)
   */
  async delete(id: number) {
    return await prisma.economicGroup.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Verify if a user has access to a group
   */
  async verifyUserAccess(groupId: number, userId: number): Promise<boolean> {
    const access = await prisma.userGroup.findUnique({
      where: {
        userId_economicGroupId: {
          userId,
          economicGroupId: groupId,
        },
      },
    });

    return access !== null;
  }

  /**
   * Verify if a group exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.economicGroup.count({
      where: { id },
    });

    return count > 0;
  }
}

// Export singleton instance
export const economicGroupsRepository = new EconomicGroupsRepository();
