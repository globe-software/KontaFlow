import { suppliersRepository } from '../repositories/suppliers.repository';
import { economicGroupsRepository } from '../repositories/economic-groups.repository';
import type { CreateSupplierDto, UpdateSupplierDto, ListSuppliersQuery } from '../validators/suppliers.schema';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Service for Suppliers
 *
 * Contains all business logic related to suppliers (auxiliary entities).
 */

export class SuppliersService {
  /**
   * List suppliers
   */
  async list(filters: ListSuppliersQuery, userId: number) {
    logger.debug({
      type: 'service',
      action: 'list_suppliers',
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

    return await suppliersRepository.findMany(filters);
  }

  /**
   * Get a supplier by ID
   */
  async getById(supplierId: number, userId: number) {
    logger.debug({
      type: 'service',
      action: 'get_supplier',
      supplierId,
      userId,
    });

    // Verify that the supplier exists
    const supplier = await suppliersRepository.findById(supplierId);

    if (!supplier) {
      throw new NotFoundError('Supplier', supplierId);
    }

    // Verify that the user has access to the economic group
    const hasAccess = await economicGroupsRepository.verifyUserAccess(supplier.economicGroupId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this supplier');
    }

    return supplier;
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'create_supplier',
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
      throw new BusinessRuleError('Cannot create suppliers for an inactive economic group', 'INACTIVE_ECONOMIC_GROUP');
    }

    // Additional business validations
    await this.validateSupplierData(data);

    // Check for duplicate name
    const isDuplicate = await suppliersRepository.findDuplicateByName(data.economicGroupId, data.name);
    if (isDuplicate) {
      throw new BusinessRuleError(
        'A supplier with this name already exists in the economic group',
        'DUPLICATE_SUPPLIER_NAME'
      );
    }

    // Create supplier
    const supplier = await suppliersRepository.create(data);

    logger.info({
      type: 'service',
      action: 'supplier_created',
      supplierId: supplier.id,
      userId,
    });

    return supplier;
  }

  /**
   * Update a supplier
   */
  async update(supplierId: number, data: UpdateSupplierDto, userId: number) {
    logger.info({
      type: 'service',
      action: 'update_supplier',
      supplierId,
      userId,
    });

    // Verify it exists
    const supplier = await suppliersRepository.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError('Supplier', supplierId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(supplier.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this supplier');
    }

    // Business validations
    if (data.email) {
      await this.validateEmail(data.email);
    }

    // Check for duplicate name if name is being updated
    if (data.name) {
      const isDuplicate = await suppliersRepository.findDuplicateByName(
        supplier.economicGroupId,
        data.name,
        supplierId
      );
      if (isDuplicate) {
        throw new BusinessRuleError(
          'A supplier with this name already exists in the economic group',
          'DUPLICATE_SUPPLIER_NAME'
        );
      }
    }

    // Update
    const updatedSupplier = await suppliersRepository.update(supplierId, data);

    logger.info({
      type: 'service',
      action: 'supplier_updated',
      supplierId,
      userId,
    });

    return updatedSupplier;
  }

  /**
   * Delete a supplier (soft delete)
   */
  async delete(supplierId: number, userId: number) {
    logger.warn({
      type: 'service',
      action: 'delete_supplier',
      supplierId,
      userId,
    });

    // Verify it exists
    const supplier = await suppliersRepository.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError('Supplier', supplierId);
    }

    // Verify access
    const hasAccess = await economicGroupsRepository.verifyUserAccess(supplier.economicGroupId, userId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this supplier');
    }

    // Soft delete
    await suppliersRepository.delete(supplierId);

    logger.info({
      type: 'service',
      action: 'supplier_deleted',
      supplierId,
      userId,
    });

    return { success: true, message: 'Supplier deleted successfully' };
  }

  /**
   * Additional business validations
   */
  private async validateSupplierData(data: Partial<CreateSupplierDto>) {
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
export const suppliersService = new SuppliersService();
