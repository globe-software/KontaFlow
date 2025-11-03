import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateCompanyDto, UpdateCompanyDto, ListCompaniesQuery } from '../validators/companies.schema';

/**
 * Repository for Companies
 *
 * Responsible for all database operations
 * related to companies.
 */

export class CompaniesRepository {
  /**
   * List companies with pagination and filters
   */
  async findMany(filters: ListCompaniesQuery) {
    const { page, limit, search, active, economicGroupId, country } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.CompanyWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tradeName: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (economicGroupId) {
      where.economicGroupId = economicGroupId;
    }

    if (country) {
      where.country = country;
    }

    // Execute query with pagination
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          economicGroupId: true,
          name: true,
          tradeName: true,
          rut: true,
          country: true,
          functionalCurrency: true,
          startDate: true,
          active: true,
          economicGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              journalEntries: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a company by ID
   */
  async findById(id: number) {
    return await prisma.company.findUnique({
      where: { id },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            mainCountry: true,
            baseCurrency: true,
          },
        },
        journalEntries: {
          select: {
            id: true,
            number: true,
            date: true,
            description: true,
            status: true,
          },
          orderBy: { date: 'desc' },
          take: 10, // Only last 10 entries
        },
        _count: {
          select: {
            journalEntries: true,
            userCompanies: true,
          },
        },
      },
    });
  }

  /**
   * Find companies by economic group ID
   */
  async findByEconomicGroupId(economicGroupId: number) {
    return await prisma.company.findMany({
      where: { economicGroupId },
      select: {
        id: true,
        name: true,
        tradeName: true,
        rut: true,
        country: true,
        functionalCurrency: true,
        active: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new company
   */
  async create(data: CreateCompanyDto) {
    return await prisma.company.create({
      data: {
        economicGroupId: data.economicGroupId,
        name: data.name,
        tradeName: data.tradeName,
        rut: data.rut,
        country: data.country,
        functionalCurrency: data.functionalCurrency,
        startDate: data.startDate,
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
   * Update a company
   */
  async update(id: number, data: UpdateCompanyDto) {
    return await prisma.company.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.tradeName !== undefined && { tradeName: data.tradeName }),
        ...(data.rut && { rut: data.rut }),
        ...(data.country && { country: data.country }),
        ...(data.functionalCurrency && { functionalCurrency: data.functionalCurrency }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
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
   * Delete a company (soft delete)
   */
  async delete(id: number) {
    return await prisma.company.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Verify if a company exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.company.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Verify if a RUT exists in an economic group (for duplicate validation)
   */
  async rutExistsInGroup(rut: string, economicGroupId: number, excludeCompanyId?: number): Promise<boolean> {
    const where: Prisma.CompanyWhereInput = {
      economicGroupId,
      rut,
    };

    if (excludeCompanyId) {
      where.id = { not: excludeCompanyId };
    }

    const count = await prisma.company.count({ where });

    return count > 0;
  }

  /**
   * Count journal entries for a company
   */
  async countJournalEntries(companyId: number): Promise<number> {
    return await prisma.journalEntry.count({
      where: { companyId },
    });
  }
}

// Export singleton instance
export const companiesRepository = new CompaniesRepository();
