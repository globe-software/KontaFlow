import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateSupplierDto, UpdateSupplierDto, ListSuppliersQuery } from '../validators/suppliers.schema';

/**
 * Repository for Suppliers
 *
 * Responsible for all database operations
 * related to suppliers (auxiliary entities).
 */

export class SuppliersRepository {
  /**
   * List suppliers with pagination and filters
   */
  async findMany(filters: ListSuppliersQuery) {
    const { page, limit, search, active, economicGroupId } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.SupplierWhereInput = {};

    if (economicGroupId) {
      where.economicGroupId = economicGroupId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    // Execute query with pagination
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          economicGroupId: true,
          name: true,
          rut: true,
          email: true,
          phone: true,
          address: true,
          active: true,
          createdAt: true,
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a supplier by ID
   */
  async findById(id: number) {
    return await prisma.supplier.findUnique({
      where: { id },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierDto) {
    return await prisma.supplier.create({
      data: {
        economicGroupId: data.economicGroupId,
        name: data.name,
        rut: data.rut,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Update a supplier
   */
  async update(id: number, data: UpdateSupplierDto) {
    return await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.rut !== undefined && { rut: data.rut }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: {
        economicGroup: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Delete a supplier (soft delete)
   */
  async delete(id: number) {
    return await prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Verify if a supplier exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.supplier.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check for duplicate supplier by name within economic group
   */
  async findDuplicateByName(economicGroupId: number, name: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.SupplierWhereInput = {
      economicGroupId,
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.supplier.count({ where });
    return count > 0;
  }
}

// Export singleton instance
export const suppliersRepository = new SuppliersRepository();
