import { prisma } from '../lib/prisma';
import type { CreateUserCompanyDto, UpdateUserCompanyDto } from '../validators/user-companies.schema';

/**
 * Repository for User-Company permissions
 *
 * Responsible for all database operations
 * related to user-company access control.
 */

export class UserCompaniesRepository {
  /**
   * Find all companies for a user
   */
  async findCompaniesByUserId(userId: number) {
    return await prisma.userCompany.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            rut: true,
            country: true,
            functionalCurrency: true,
            active: true,
            economicGroupId: true,
          },
        },
      },
      orderBy: {
        company: {
          name: 'asc',
        },
      },
    });
  }

  /**
   * Find all users for a company
   */
  async findUsersByCompanyId(companyId: number) {
    return await prisma.userCompany.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  /**
   * Find a specific user-company permission
   */
  async findByUserAndCompany(userId: number, companyId: number) {
    return await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            rut: true,
            country: true,
            functionalCurrency: true,
            active: true,
            economicGroupId: true,
          },
        },
      },
    });
  }

  /**
   * Grant company access to a user
   */
  async create(data: CreateUserCompanyDto) {
    return await prisma.userCompany.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        canWrite: data.canWrite,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            rut: true,
            active: true,
          },
        },
      },
    });
  }

  /**
   * Update user-company permissions
   */
  async update(userId: number, companyId: number, data: UpdateUserCompanyDto) {
    return await prisma.userCompany.update({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      data: {
        canWrite: data.canWrite,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
      },
    });
  }

  /**
   * Revoke company access from a user
   */
  async delete(userId: number, companyId: number) {
    return await prisma.userCompany.delete({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });
  }

  /**
   * Check if a user has access to a company
   */
  async hasAccess(userId: number, companyId: number): Promise<boolean> {
    const count = await prisma.userCompany.count({
      where: {
        userId,
        companyId,
      },
    });

    return count > 0;
  }

  /**
   * Check if a user has write access to a company
   */
  async hasWriteAccess(userId: number, companyId: number): Promise<boolean> {
    const count = await prisma.userCompany.count({
      where: {
        userId,
        companyId,
        canWrite: true,
      },
    });

    return count > 0;
  }

  /**
   * Verify if user exists
   */
  async userExists(userId: number): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id: userId },
    });

    return count > 0;
  }

  /**
   * Verify if company exists
   */
  async companyExists(companyId: number): Promise<boolean> {
    const count = await prisma.company.count({
      where: { id: companyId },
    });

    return count > 0;
  }
}

// Export singleton instance
export const userCompaniesRepository = new UserCompaniesRepository();
