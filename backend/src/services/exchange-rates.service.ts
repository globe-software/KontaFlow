import { exchangeRatesRepository } from '../repositories/exchange-rates.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type { CreateExchangeRateDto, UpdateExchangeRateDto, ListExchangeRatesQuery } from '../validators/exchange-rates.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Exchange Rates
 *
 * Contains all business logic related to exchange rates (currency conversion).
 */

export class ExchangeRatesService {
  /**
   * List exchange rates
   */
  async list(filters: ListExchangeRatesQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_exchange_rates',
      userId,
      filters,
    });

    // If economicGroupId is provided, verify user has access
    if (filters.economicGroupId) {
      const hasAccess = await economicGroupsRepository.verifyUserAccess(filters.economicGroupId, userId);
      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this economic group');
      }
    }

    return await exchangeRatesRepository.findMany(filters);
  }

  /**
   * Get an exchange rate by ID
   */
  async getById(rateId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_exchange_rate',
      rateId,
      userId,
    });

    // Verify that the exchange rate exists
    const rate = await exchangeRatesRepository.findById(rateId);

    if (!rate) {
      throw new NotFoundError('Exchange Rate', rateId);
    }

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(rate.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this exchange rate');
    }

    return rate;
  }

  /**
   * Create a new exchange rate
   */
  async create(data: CreateExchangeRateDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_exchange_rate',
      userId,
      economicGroupId: data.economicGroupId,
      date: data.date,
      sourceCurrency: data.sourceCurrency,
      targetCurrency: data.targetCurrency,
    });

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(data.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    // Verify that the economic group exists and is active
    const economicGroup = await economicGroupsRepository.findById(data.economicGroupId);
    if (!economicGroup) {
      throw new NotFoundError('Economic Group', data.economicGroupId);
    }

    if (!economicGroup.active) {
      throw new BusinessRuleError(
        'Cannot create exchange rates for an inactive economic group',
        'INACTIVE_ECONOMIC_GROUP'
      );
    }

    // Additional business validations
    await this.validateExchangeRateData(data, economicGroup.baseCurrency);

    // Check for duplicate exchange rate
    const isDuplicate = await exchangeRatesRepository.findDuplicate(
      data.economicGroupId,
      data.date,
      data.sourceCurrency,
      data.targetCurrency
    );

    if (isDuplicate) {
      throw new BusinessRuleError(
        'An exchange rate for this date and currency pair already exists',
        'DUPLICATE_EXCHANGE_RATE'
      );
    }

    // Create exchange rate
    const rate = await exchangeRatesRepository.create(data);

    logger.info({
      type: 'service',
      action: 'exchange_rate_created',
      rateId: rate.id,
      userId,
    });

    return rate;
  }

  /**
   * Update an exchange rate
   */
  async update(rateId: number, data: UpdateExchangeRateDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_exchange_rate',
      rateId,
      userId,
    });

    // Verify it exists
    const rate = await exchangeRatesRepository.findById(rateId);
    if (!rate) {
      throw new NotFoundError('Exchange Rate', rateId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(rate.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this exchange rate');
    }

    // Business validations
    if (data.rate !== undefined) {
      if (data.rate <= 0) {
        throw new BusinessRuleError('Exchange rate must be greater than 0', 'INVALID_RATE');
      }
    }

    // Update
    const updatedRate = await exchangeRatesRepository.update(rateId, data);

    logger.info({
      type: 'service',
      action: 'exchange_rate_updated',
      rateId,
      userId,
    });

    return updatedRate;
  }

  /**
   * Delete an exchange rate (hard delete)
   */
  async delete(rateId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_exchange_rate',
      rateId,
      userId,
    });

    // Verify it exists
    const rate = await exchangeRatesRepository.findById(rateId);
    if (!rate) {
      throw new NotFoundError('Exchange Rate', rateId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(rate.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this exchange rate');
    }

    // Hard delete
    await exchangeRatesRepository.delete(rateId);

    logger.info({
      type: 'service',
      action: 'exchange_rate_deleted',
      rateId,
      userId,
    });

    return { success: true, message: 'Exchange rate deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateExchangeRateData(data: CreateExchangeRateDto, baseCurrency: string) {
    // Validate that rate is positive
    if (data.rate <= 0) {
      throw new BusinessRuleError('Exchange rate must be greater than 0', 'INVALID_RATE');
    }

    // Validate that source and target currencies are different
    if (data.sourceCurrency === data.targetCurrency) {
      throw new BusinessRuleError(
        'Source and target currencies must be different',
        'SAME_CURRENCIES'
      );
    }

    // Validate that target currency matches economic group's base currency
    if (data.targetCurrency !== baseCurrency) {
      throw new BusinessRuleError(
        `Target currency must be the economic group's base currency (${baseCurrency})`,
        'INVALID_TARGET_CURRENCY'
      );
    }

    // Validate that date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rateDate = new Date(data.date);
    rateDate.setHours(0, 0, 0, 0);

    if (rateDate > today) {
      throw new BusinessRuleError('Exchange rate date cannot be in the future', 'FUTURE_DATE');
    }
  }
}

// Export singleton instance
export const exchangeRatesService = new ExchangeRatesService();
