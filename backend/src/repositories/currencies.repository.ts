import { prisma } from '../lib/prisma';
import type { CurrencyModel } from '@prisma/client';
import type {  ListCurrenciesQuery } from '../validators/currencies.schema';

/**
 * Repository for Currencies
 *
 * Handles all database operations for the Currency model.
 */

export class CurrenciesRepository {
  /**
   * Find all currencies with pagination and filters
   */
  async findMany(filters: ListCurrenciesQuery) {
    const { page = 1, limit = 50, search, active } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    // Execute queries in parallel
    const [currencies, total] = await Promise.all([
      prisma.currencyModel.findMany({
        where,
        orderBy: { code: 'asc' },
        skip,
        take: limit,
      }),
      prisma.currencyModel.count({ where }),
    ]);

    return {
      data: currencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find currency by code
   */
  async findByCode(code: string): Promise<CurrencyModel | null> {
    return await prisma.currencyModel.findUnique({
      where: { code },
    });
  }

  /**
   * Create a new currency
   */
  async create(data: {
    code: string;
    name: string;
    symbol?: string;
    active?: boolean;
    decimals?: number;
    isDefaultFunctional?: boolean;
  }): Promise<CurrencyModel> {
    return await prisma.currencyModel.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        symbol: data.symbol,
        active: data.active ?? true,
        decimals: data.decimals ?? 2,
        isDefaultFunctional: data.isDefaultFunctional ?? false,
      },
    });
  }

  /**
   * Update a currency
   */
  async update(
    code: string,
    data: {
      name?: string;
      symbol?: string;
      active?: boolean;
      decimals?: number;
      isDefaultFunctional?: boolean;
    }
  ): Promise<CurrencyModel> {
    return await prisma.currencyModel.update({
      where: { code },
      data,
    });
  }

  /**
   * Delete a currency (hard delete)
   * Note: This will fail if the currency is referenced by other records due to FK constraints
   */
  async delete(code: string): Promise<void> {
    await prisma.currencyModel.delete({
      where: { code },
    });
  }

  /**
   * Check if currency is in use (has references)
   */
  async isInUse(code: string): Promise<boolean> {
    const [companiesCount, economicGroupsCount, exchangeRatesCount] = await Promise.all([
      prisma.company.count({
        where: { functionalCurrency: code },
      }),
      prisma.economicGroup.count({
        where: { baseCurrency: code },
      }),
      prisma.exchangeRate.count({
        where: {
          OR: [{ sourceCurrency: code }, { targetCurrency: code }],
        },
      }),
    ]);

    return companiesCount > 0 || economicGroupsCount > 0 || exchangeRatesCount > 0;
  }

  /**
   * Get the default functional currency
   */
  async getDefaultFunctional(): Promise<CurrencyModel | null> {
    return await prisma.currencyModel.findFirst({
      where: { isDefaultFunctional: true, active: true },
    });
  }

  /**
   * Get all active currencies
   */
  async getAllActive(): Promise<CurrencyModel[]> {
    return await prisma.currencyModel.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });
  }
}

// Export singleton instance
export const currenciesRepository = new CurrenciesRepository();
