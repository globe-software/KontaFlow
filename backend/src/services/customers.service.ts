import { customersRepository } from '../repositories/customers.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type { CreateCustomerDto, UpdateCustomerDto, ListCustomersQuery } from '../validators/customers.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Customers
 *
 * Contains all business logic related to customers (auxiliary entities).
 */

export class CustomersService {
  /**
   * List customers
   */
  async list(filters: ListCustomersQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_customers',
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

    return await customersRepository.findMany(filters);
  }

  /**
   * Get a customer by ID
   */
  async getById(customerId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_customer',
      customerId,
      userId,
    });

    // Verify that the customer exists
    const customer = await customersRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundError('Customer', customerId);
    }

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(customer.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this customer');
    }

    return customer;
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_customer',
      userId,
      name: data.name,
      economicGroupId: data.economicGroupId,
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
      throw new BusinessRuleError('Cannot create customers for an inactive economic group', 'INACTIVE_ECONOMIC_GROUP');
    }

    // Additional business validations
    await this.validateCustomerData(data);

    // Check for duplicate name
    const isDuplicate = await customersRepository.findDuplicateByName(data.economicGroupId, data.name);
    if (isDuplicate) {
      throw new BusinessRuleError(
        'A customer with this name already exists in the economic group',
        'DUPLICATE_CUSTOMER_NAME'
      );
    }

    // Create customer
    const customer = await customersRepository.create(data);

    logger.info({
      type: 'service',
      action: 'customer_created',
      customerId: customer.id,
      userId,
    });

    return customer;
  }

  /**
   * Update a customer
   */
  async update(customerId: number, data: UpdateCustomerDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_customer',
      customerId,
      userId,
    });

    // Verify it exists
    const customer = await customersRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer', customerId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(customer.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this customer');
    }

    // Business validations
    if (data.email) {
      await this.validateEmail(data.email);
    }

    // Check for duplicate name if name is being updated
    if (data.name) {
      const isDuplicate = await customersRepository.findDuplicateByName(
        customer.economicGroupId,
        data.name,
        customerId
      );
      if (isDuplicate) {
        throw new BusinessRuleError(
          'A customer with this name already exists in the economic group',
          'DUPLICATE_CUSTOMER_NAME'
        );
      }
    }

    // Update
    const updatedCustomer = await customersRepository.update(customerId, data);

    logger.info({
      type: 'service',
      action: 'customer_updated',
      customerId,
      userId,
    });

    return updatedCustomer;
  }

  /**
   * Delete a customer (soft delete)
   */
  async delete(customerId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_customer',
      customerId,
      userId,
    });

    // Verify it exists
    const customer = await customersRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer', customerId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(customer.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this customer');
    }

    // Soft delete
    await customersRepository.delete(customerId);

    logger.info({
      type: 'service',
      action: 'customer_deleted',
      customerId,
      userId,
    });

    return { success: true, message: 'Customer deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateCustomerData(data: Partial<CreateCustomerDto>) {
    // Validate that the name is not empty
    if (data.name && data.name.trim().length < 3) {
      throw new BusinessRuleError('Name must be at least 3 characters');
    }

    // Validate email format if provided
    if (data.email) {
      await this.validateEmail(data.email);
    }
  }

  /**
   * Validate email format
   */
  private async validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BusinessRuleError('Invalid email format', 'INVALID_EMAIL');
    }
  }
}

// Export singleton instance
export const customersService = new CustomersService();
