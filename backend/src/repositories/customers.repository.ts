import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { CreateCustomerDto, UpdateCustomerDto, ListCustomersQuery } from '../validators/customers.schema';

/**
 * Repository for Customers
 *
 * Responsible for all database operations
 * related to customers (auxiliary entities).
 */

export class CustomersRepository {
  /**
   * List customers with pagination and filters
   */
  async findMany(filters: ListCustomersQuery) {
    const { page, limit, search, active, economicGroupId } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.CustomerWhereInput = {};

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
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
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
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a customer by ID
   */
  async findById(id: number) {
    return await prisma.customer.findUnique({
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
   * Create a new customer
   */
  async create(data: CreateCustomerDto) {
    return await prisma.customer.create({
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
   * Update a customer
   */
  async update(id: number, data: UpdateCustomerDto) {
    return await prisma.customer.update({
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
   * Delete a customer (soft delete)
   */
  async delete(id: number) {
    return await prisma.customer.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Verify if a customer exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.customer.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check for duplicate customer by name within economic group
   */
  async findDuplicateByName(economicGroupId: number, name: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.CustomerWhereInput = {
      economicGroupId,
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.customer.count({ where });
    return count > 0;
  }
}

// Export singleton instance
export const customersRepository = new CustomersRepository();
