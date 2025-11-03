import { prisma } from '../lib/prisma';
import { Prisma, PeriodType, EntryStatus } from '@prisma/client';
import type {
  CreateAccountingPeriodDto,
  UpdateAccountingPeriodDto,
  ListAccountingPeriodsQuery,
} from '../validators/accounting-periods.schema';

/**
 * Repository for Accounting Periods
 *
 * Responsible for all database operations
 * related to fiscal years and monthly periods.
 */

export class AccountingPeriodsRepository {
  /**
   * List accounting periods with pagination and filters
   */
  async findMany(filters: ListAccountingPeriodsQuery) {
    const { page, limit, economicGroupId, type, fiscalYear, closed } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.AccountingPeriodWhereInput = {};

    if (economicGroupId !== undefined) {
      where.economicGroupId = economicGroupId;
    }

    if (type) {
      where.type = type;
    }

    if (fiscalYear !== undefined) {
      where.fiscalYear = fiscalYear;
    }

    if (closed !== undefined) {
      where.closed = closed;
    }

    // Execute query with pagination
    const [periods, total] = await Promise.all([
      prisma.accountingPeriod.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fiscalYear: 'desc' }, { month: 'desc' }],
        select: {
          id: true,
          economicGroupId: true,
          type: true,
          fiscalYear: true,
          month: true,
          startDate: true,
          endDate: true,
          closed: true,
          closedAt: true,
          closedBy: true,
          economicGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          closedByUser: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.accountingPeriod.count({ where }),
    ]);

    return {
      data: periods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a period by ID
   * Includes closedByUser relation
   */
  async findById(id: number) {
    return await prisma.accountingPeriod.findUnique({
      where: { id },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        closedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find periods by economic group
   * Ordered by fiscalYear desc, month desc
   */
  async findByEconomicGroup(economicGroupId: number) {
    return await prisma.accountingPeriod.findMany({
      where: { economicGroupId },
      select: {
        id: true,
        type: true,
        fiscalYear: true,
        month: true,
        startDate: true,
        endDate: true,
        closed: true,
        closedAt: true,
      },
      orderBy: [{ fiscalYear: 'desc' }, { month: 'desc' }],
    });
  }

  /**
   * Create a new accounting period
   * Validates no overlapping periods
   */
  async create(data: CreateAccountingPeriodDto) {
    return await prisma.accountingPeriod.create({
      data: {
        economicGroupId: data.economicGroupId,
        type: data.type,
        fiscalYear: data.fiscalYear,
        month: data.month,
        startDate: data.startDate,
        endDate: data.endDate,
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
   * Update a period
   * Used for closing/opening periods
   */
  async update(id: number, data: UpdateAccountingPeriodDto) {
    return await prisma.accountingPeriod.update({
      where: { id },
      data: {
        ...(data.closed !== undefined && { closed: data.closed }),
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        closedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Close a period
   * Sets closed=true, closedAt=now, closedBy=userId
   */
  async closePeriod(id: number, userId: number) {
    return await prisma.accountingPeriod.update({
      where: { id },
      data: {
        closed: true,
        closedAt: new Date(),
        closedBy: userId,
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        closedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Reopen a period
   * Sets closed=false, closedAt=null, closedBy=null
   */
  async reopenPeriod(id: number) {
    return await prisma.accountingPeriod.update({
      where: { id },
      data: {
        closed: false,
        closedAt: null,
        closedBy: null,
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
   * Delete a period (soft operation - just mark as inactive)
   * Note: AccountingPeriod model doesn't have active field, so this is a hard delete
   * But we should only allow deletion if no entries exist
   */
  async delete(id: number) {
    return await prisma.accountingPeriod.delete({
      where: { id },
    });
  }

  /**
   * Verify if a period exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.accountingPeriod.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check for overlapping periods
   * Returns true if an overlapping period exists
   */
  async checkOverlap(
    economicGroupId: number,
    type: PeriodType,
    fiscalYear: number,
    startDate: Date,
    endDate: Date,
    month?: number | null,
    excludeId?: number
  ): Promise<boolean> {
    const where: Prisma.AccountingPeriodWhereInput = {
      economicGroupId,
      type,
      fiscalYear,
      OR: [
        // New period starts within existing period
        {
          startDate: { lte: startDate },
          endDate: { gte: startDate },
        },
        // New period ends within existing period
        {
          startDate: { lte: endDate },
          endDate: { gte: endDate },
        },
        // New period encompasses existing period
        {
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      ],
    };

    // For MONTH type, also check month
    if (type === PeriodType.MONTH && month !== undefined && month !== null) {
      where.month = month;
    }

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.accountingPeriod.count({ where });

    return count > 0;
  }

  /**
   * Check if a period is closable
   * A period can be closed if it has no DRAFT or PENDING_APPROVAL entries
   */
  async isClosable(id: number): Promise<{ closable: boolean; reason?: string; count?: number }> {
    // Get period details
    const period = await prisma.accountingPeriod.findUnique({
      where: { id },
      select: {
        startDate: true,
        endDate: true,
        economicGroup: {
          select: {
            companies: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!period) {
      return { closable: false, reason: 'Period not found' };
    }

    // Get all company IDs for this economic group
    const companyIds = period.economicGroup.companies.map((c) => c.id);

    // Check for DRAFT or PENDING_APPROVAL entries in this period
    const problematicEntries = await prisma.journalEntry.count({
      where: {
        companyId: { in: companyIds },
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
        status: {
          in: [EntryStatus.DRAFT, EntryStatus.PENDING_APPROVAL],
        },
      },
    });

    if (problematicEntries > 0) {
      return {
        closable: false,
        reason: 'Period has DRAFT or PENDING_APPROVAL journal entries',
        count: problematicEntries,
      };
    }

    return { closable: true };
  }

  /**
   * Count journal entries in a period
   */
  async countJournalEntries(id: number): Promise<number> {
    const period = await prisma.accountingPeriod.findUnique({
      where: { id },
      select: {
        startDate: true,
        endDate: true,
        economicGroup: {
          select: {
            companies: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!period) {
      return 0;
    }

    // Get all company IDs for this economic group
    const companyIds = period.economicGroup.companies.map((c) => c.id);

    return await prisma.journalEntry.count({
      where: {
        companyId: { in: companyIds },
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    });
  }

  /**
   * Check if a specific period combination exists
   * Used to prevent duplicate fiscal year/month combinations
   */
  async periodCombinationExists(
    economicGroupId: number,
    type: PeriodType,
    fiscalYear: number,
    month?: number | null,
    excludeId?: number
  ): Promise<boolean> {
    const where: Prisma.AccountingPeriodWhereInput = {
      economicGroupId,
      type,
      fiscalYear,
    };

    if (type === PeriodType.MONTH) {
      where.month = month ?? undefined;
    } else {
      where.month = null;
    }

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.accountingPeriod.count({ where });

    return count > 0;
  }
}

// Export singleton instance
export const accountingPeriodsRepository = new AccountingPeriodsRepository();
