import { companiesRepository } from '../repositories/companies.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type { CreateCompanyDto, UpdateCompanyDto, ListCompaniesQuery } from '../validators/companies.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Companies
 *
 * Contains all business logic related to companies.
 */

export class CompaniesService {
  /**
   * List companies
   */
  async list(filters: ListCompaniesQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_companies',
      userId,
      filters,
    });

    // TODO: Filter only companies the user has access to
    // For now we return all
    return await companiesRepository.findMany(filters);
  }

  /**
   * Get a company by ID
   */
  async getById(companyId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_company',
      companyId,
      userId,
    });

    // Verify that the company exists
    const company = await companiesRepository.findById(companyId);

    if (!company) {
      throw new NotFoundError('Company', companyId);
    }

    // TODO: Verify that the user has access to this company
    // For now we allow access to all

    return company;
  }

  /**
   * Get companies by economic group
   */
  async getByEconomicGroup(economicGroupId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_companies_by_group',
      economicGroupId,
      userId,
    });

    // Verify the economic group exists
    const groupExists = await economicGroupsRepository.exists(economicGroupId);
    if (!groupExists) {
      throw new NotFoundError('Economic Group', economicGroupId);
    }

    // Verify user has access to the group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    return await companiesRepository.findByEconomicGroupId(economicGroupId);
  }

  /**
   * Create a new company
   */
  async create(data: CreateCompanyDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_company',
      userId,
      name: data.name,
      economicGroupId: data.economicGroupId,
    });

    // Verify the economic group exists
    const groupExists = await economicGroupsRepository.exists(data.economicGroupId);
    if (!groupExists) {
      throw new NotFoundError('Economic Group', data.economicGroupId);
    }

    // Verify user has access to the group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(data.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this economic group');
    }

    // Business validations
    await this.validateCompanyData(data);

    // Check for duplicate RUT in the same economic group
    const rutExists = await companiesRepository.rutExistsInGroup(data.rut, data.economicGroupId);
    if (rutExists) {
      throw new BusinessRuleError(
        `A company with RUT ${data.rut} already exists in this economic group`,
        'DUPLICATE_RUT'
      );
    }

    // Create company
    const company = await companiesRepository.create(data);

    logger.info({
      type: 'service',
      action: 'company_created',
      companyId: company.id,
      userId,
    });

    return company;
  }

  /**
   * Update a company
   */
  async update(companyId: number, data: UpdateCompanyDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_company',
      companyId,
      userId,
    });

    // Verify it exists
    const company = await companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company', companyId);
    }

    // Verify user has access to the company's economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(company.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this company');
    }

    // TODO: Verify that the user is ADMIN or ACCOUNTANT of the group

    // Business validations
    if (data.name || data.country || data.functionalCurrency) {
      await this.validateCompanyData(data as CreateCompanyDto);
    }

    // Check for duplicate RUT if RUT is being updated
    if (data.rut) {
      const rutExists = await companiesRepository.rutExistsInGroup(
        data.rut,
        company.economicGroupId,
        companyId
      );
      if (rutExists) {
        throw new BusinessRuleError(
          `A company with RUT ${data.rut} already exists in this economic group`,
          'DUPLICATE_RUT'
        );
      }
    }

    // Update
    const updatedCompany = await companiesRepository.update(companyId, data);

    logger.info({
      type: 'service',
      action: 'company_updated',
      companyId,
      userId,
    });

    return updatedCompany;
  }

  /**
   * Delete a company (soft delete)
   */
  async delete(companyId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_company',
      companyId,
      userId,
    });

    // Verify it exists
    const company = await companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company', companyId);
    }

    // Verify user has access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(company.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this company');
    }

    // TODO: Verify that the user is ADMIN of the group

    // Validate there are no journal entries (business rule: cannot delete companies with accounting history)
    const entryCount = await companiesRepository.countJournalEntries(companyId);
    if (entryCount > 0) {
      throw new BusinessRuleError(
        `Cannot delete a company with ${entryCount} journal entries. You can deactivate it instead.`,
        'HAS_JOURNAL_ENTRIES'
      );
    }

    // Soft delete
    await companiesRepository.delete(companyId);

    logger.info({
      type: 'service',
      action: 'company_deleted',
      companyId,
      userId,
    });

    return { success: true, message: 'Company deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateCompanyData(data: Partial<CreateCompanyDto>) {
    // Validate that the name is not empty (Zod already does this, but for safety)
    if (data.name && data.name.trim().length < 3) {
      throw new BusinessRuleError('Name must be at least 3 characters');
    }

    // Validate RUT format based on country
    if (data.rut && data.country) {
      await this.validateRutForCountry(data.rut, data.country);
    }

    // Validate functional currency is compatible with country
    if (data.country && data.functionalCurrency) {
      await this.validateCurrencyForCountry(data.functionalCurrency, data.country);
    }

    // TODO: Add more business validations as required
  }

  /**
   * Validate RUT format based on country
   */
  private async validateRutForCountry(rut: string, country: string) {
    // Uruguay: 12 digits
    if (country === 'UY') {
      if (!/^\d{12}$/.test(rut)) {
        throw new BusinessRuleError(
          'For Uruguay, RUT must be exactly 12 digits',
          'INVALID_RUT_FORMAT'
        );
      }
    }

    // TODO: Add validation for other countries
    // Argentina: CUIT - 11 digits
    // Brazil: CNPJ - 14 digits
    // etc.
  }

  /**
   * Validate currency is appropriate for country
   */
  private async validateCurrencyForCountry(currency: string, country: string) {
    const validCombinations: Record<string, string[]> = {
      UY: ['UYU', 'USD'],
      AR: ['ARS', 'USD'],
      BR: ['BRL', 'USD'],
      CL: ['CLP', 'USD'],
      CO: ['COP', 'USD'],
      PE: ['PEN', 'USD'],
      MX: ['MXN', 'USD'],
      US: ['USD'],
      ES: ['EUR', 'USD'],
    };

    const validCurrencies = validCombinations[country];
    if (validCurrencies && !validCurrencies.includes(currency)) {
      throw new BusinessRuleError(
        `For ${country}, functional currency must be one of: ${validCurrencies.join(', ')}`,
        'INVALID_CURRENCY_FOR_COUNTRY'
      );
    }
  }
}

// Export singleton instance
export const companiesService = new CompaniesService();
