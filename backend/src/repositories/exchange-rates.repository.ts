import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateExchangeRateDto, UpdateExchangeRateDto, ListExchangeRatesQuery } from '../validators/exchange-rates.schema';

/**
 * Repository for Exchange Rates
 *
 * Responsible for all database operations
 * related to exchange rates (currency conversion).
 */

export class ExchangeRatesRepository {
  /**
   * List exchange rates with pagination and filters
   */
  async findMany(filters: ListExchangeRatesQuery) {
    const { page, limit, economicGroupId, sourceCurrency, targetCurrency, dateFrom, dateTo } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.ExchangeRateWhereInput = {};

    if (economicGroupId) {
      where.economicGroupId = economicGroupId;
    }

    if (sourceCurrency) {
      where.sourceCurrency = sourceCurrency;
    }

    if (targetCurrency) {
      where.targetCurrency = targetCurrency;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = dateFrom;
      }
      if (dateTo) {
        where.date.lte = dateTo;
      }
    }

    // Execute query with pagination
    const [rates, total] = await Promise.all([
      prisma.exchangeRate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          economicGroupId: true,
          date: true,
          sourceCurrency: true,
          targetCurrency: true,
          rate: true,
          source: true,
          createdAt: true,
        },
      }),
      prisma.exchangeRate.count({ where }),
    ]);

    return {
      data: rates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find an exchange rate by ID
   */
  async findById(id: number) {
    return await prisma.exchangeRate.findUnique({
      where: { id },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Create a new exchange rate
   */
  async create(data: CreateExchangeRateDto) {
    return await prisma.exchangeRate.create({
      data: {
        economicGroupId: data.economicGroupId,
        date: data.date,
        sourceCurrency: data.sourceCurrency,
        targetCurrency: data.targetCurrency,
        rate: data.rate,
        source: data.source,
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Update an exchange rate
   */
  async update(id: number, data: UpdateExchangeRateDto) {
    return await prisma.exchangeRate.update({
      where: { id },
      data: {
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.source !== undefined && { source: data.source }),
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Delete an exchange rate (hard delete)
   */
  async delete(id: number) {
    return await prisma.exchangeRate.delete({
      where: { id },
    });
  }

  /**
   * Verify if an exchange rate exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.exchangeRate.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check for duplicate exchange rate
   * Unique constraint: [economicGroupId, date, sourceCurrency, targetCurrency]
   */
  async findDuplicate(
    economicGroupId: number,
    date: Date,
    sourceCurrency: string,
    targetCurrency: string,
    excludeId?: number
  ): Promise<boolean> {
    const where: Prisma.ExchangeRateWhereInput = {
      economicGroupId,
      date,
      sourceCurrency,
      targetCurrency,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.exchangeRate.count({ where });
    return count > 0;
  }

  /**
   * Find exchange rate for a specific date and currency pair
   */
  async findByDateAndCurrencies(
    economicGroupId: number,
    date: Date,
    sourceCurrency: string,
    targetCurrency: string
  ) {
    return await prisma.exchangeRate.findUnique({
      where: {
        economicGroupId_date_sourceCurrency_targetCurrency: {
          economicGroupId,
          date,
          sourceCurrency,
          targetCurrency,
        },
      },
    });
  }
}

// Export singleton instance
export const exchangeRatesRepository = new ExchangeRatesRepository();
