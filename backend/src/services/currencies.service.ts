import { currenciesRepository } from '../repositories/currencies.repository';
import type {
  CreateCurrencyDto,
  UpdateCurrencyDto,
  ListCurrenciesQuery,
} from '../validators/currencies.schema';
import { NotFoundError, BusinessRuleError, ConflictError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Currencies
 *
 * Contains all business logic related to currency management.
 */

export class CurrenciesService {
  /**
   * List all currencies with pagination and filters
   */
  async list(filters: ListCurrenciesQuery) {
    logger.debug({
      type: 'service',
      action: 'list_currencies',
      filters,
    });

    return await currenciesRepository.findMany(filters);
  }

  /**
   * Get a currency by code
   */
  async getByCode(code: string) {
    logger.debug({
      type: 'service',
      action: 'get_currency',
      code,
    });

    const currency = await currenciesRepository.findByCode(code);

    if (!currency) {
      throw new NotFoundError('Currency', code);
    }

    return currency;
  }

  /**
   * Create a new currency
   */
  async create(data: CreateCurrencyDto) {
    logger.info({
      type: 'service',
      action: 'create_currency',
      code: data.code,
    });

    // Check if currency already exists
    const existingCurrency = await currenciesRepository.findByCode(data.code);
    if (existingCurrency) {
      throw new ConflictError(`Currency with code ${data.code} already exists`);
    }

    // If setting as default functional, ensure only one default exists
    if (data.isDefaultFunctional) {
      const currentDefault = await currenciesRepository.getDefaultFunctional();
      if (currentDefault) {
        throw new BusinessRuleError(
          `Currency ${currentDefault.code} is already set as default functional currency. ` +
            `Please unset it first before setting a new default.`,
          'MULTIPLE_DEFAULT_FUNCTIONAL'
        );
      }
    }

    // Validate currency code format (ISO 4217)
    if (!this.isValidCurrencyCode(data.code)) {
      throw new BusinessRuleError(
        'Currency code must follow ISO 4217 standard (3 uppercase letters)',
        'INVALID_CURRENCY_CODE'
      );
    }

    // Create currency
    const currency = await currenciesRepository.create(data);

    logger.info({
      type: 'service',
      action: 'currency_created',
      code: currency.code,
    });

    return currency;
  }

  /**
   * Update a currency
   */
  async update(code: string, data: UpdateCurrencyDto) {
    logger.info({
      type: 'service',
      action: 'update_currency',
      code,
    });

    // Verify it exists
    const currency = await currenciesRepository.findByCode(code);
    if (!currency) {
      throw new NotFoundError('Currency', code);
    }

    // If setting as default functional, ensure only one default exists
    if (data.isDefaultFunctional && !currency.isDefaultFunctional) {
      const currentDefault = await currenciesRepository.getDefaultFunctional();
      if (currentDefault && currentDefault.code !== code) {
        throw new BusinessRuleError(
          `Currency ${currentDefault.code} is already set as default functional currency. ` +
            `Please unset it first before setting a new default.`,
          'MULTIPLE_DEFAULT_FUNCTIONAL'
        );
      }
    }

    // Don't allow deactivating a currency that's in use
    if (data.active === false && currency.active) {
      const inUse = await currenciesRepository.isInUse(code);
      if (inUse) {
        throw new BusinessRuleError(
          `Cannot deactivate currency ${code} because it is currently in use by companies, economic groups, or exchange rates`,
          'CURRENCY_IN_USE'
        );
      }
    }

    // Update
    const updatedCurrency = await currenciesRepository.update(code, data);

    logger.info({
      type: 'service',
      action: 'currency_updated',
      code,
    });

    return updatedCurrency;
  }

  /**
   * Delete a currency (hard delete)
   */
  async delete(code: string) {
    logger.warn({
      type: 'service',
      action: 'delete_currency',
      code,
    });

    // Verify it exists
    const currency = await currenciesRepository.findByCode(code);
    if (!currency) {
      throw new NotFoundError('Currency', code);
    }

    // Check if currency is in use
    const inUse = await currenciesRepository.isInUse(code);
    if (inUse) {
      throw new BusinessRuleError(
        `Cannot delete currency ${code} because it is currently in use by companies, economic groups, or exchange rates. ` +
          `Deactivate it instead if you want to prevent new usage.`,
        'CURRENCY_IN_USE'
      );
    }

    // Don't allow deleting the default functional currency
    if (currency.isDefaultFunctional) {
      throw new BusinessRuleError(
        `Cannot delete the default functional currency ${code}. Please set another currency as default first.`,
        'DELETE_DEFAULT_FUNCTIONAL'
      );
    }

    // Hard delete
    await currenciesRepository.delete(code);

    logger.info({
      type: 'service',
      action: 'currency_deleted',
      code,
    });

    return { success: true, message: 'Currency deleted successfully' };
  }

  /**
   * Get all active currencies (for dropdowns/selects)
   */
  async getAllActive() {
    logger.debug({
      type: 'service',
      action: 'get_all_active_currencies',
    });

    return await currenciesRepository.getAllActive();
  }

  /**
   * Validate currency code format (ISO 4217)
   */
  private isValidCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }
}

// Export singleton instance
export const currenciesService = new CurrenciesService();
