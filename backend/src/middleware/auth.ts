import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

/**
 * Authentication middleware
 *
 * NOTE: This is a simplified version for development/testing.
 * In production it will integrate with Clerk for real JWT authentication.
 *
 * For now, it accepts an 'x-user-id' header to simulate users.
 */

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      name: string;
      economicGroupId: number;
      role: string;
    };
  }
}

/**
 * Middleware to authenticate users
 * Verifies that the request has a valid user
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    // In development: allow authentication with x-user-id header
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new UnauthorizedError('No authentication provided');
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        groups: {
          include: {
            economicGroup: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.active) {
      throw new ForbiddenError('User deactivated');
    }

    // Verify has access to at least one group
    if (user.groups.length === 0) {
      throw new ForbiddenError('User has no economic group assigned');
    }

    // For now, use the first group
    // TODO: Allow user to select active group
    const activeGroup = user.groups[0];

    // Add user to request
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      economicGroupId: activeGroup.economicGroupId,
      role: activeGroup.role,
    };

    logger.debug({
      type: 'auth',
      userId: user.id,
      economicGroupId: activeGroup.economicGroupId,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }

    logger.error({
      type: 'auth_error',
      error,
    });

    throw new UnauthorizedError('Error authenticating user');
  }
}

/**
 * Middleware to verify roles
 * Use after authenticateUser
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(
        `One of the following roles is required: ${allowedRoles.join(', ')}`
      );
    }
  };
}

/**
 * Middleware to verify access to an economic group
 */
export async function verifyGroupAccess(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    throw new UnauthorizedError();
  }

  // Get groupId from parameter or query
  const groupId =
    Number((request.params as any).groupId) ||
    Number((request.query as any).groupId);

  if (groupId && groupId !== request.user.economicGroupId) {
    throw new ForbiddenError('You do not have access to this economic group');
  }
}

/**
 * TODO: Clerk Integration
 *
 * When Clerk is integrated, replace authenticateUser with:
 *
 * import { clerkClient } from '@clerk/backend';
 *
 * export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
 *   const token = request.headers.authorization?.replace('Bearer ', '');
 *
 *   if (!token) {
 *     throw new UnauthorizedError();
 *   }
 *
 *   try {
 *     // Verify JWT with Clerk
 *     const session = await clerkClient.sessions.verifySession(sessionId, token);
 *     const clerkUser = await clerkClient.users.getUser(session.userId);
 *
 *     // Find user in our DB
 *     const user = await prisma.user.findUnique({
 *       where: { authProviderId: clerkUser.id }
 *     });
 *
 *     request.user = {
 *       id: user.id,
 *       email: clerkUser.emailAddresses[0].emailAddress,
 *       ...
 *     };
 *   } catch (error) {
 *     throw new UnauthorizedError('Invalid token');
 *   }
 * }
 */
