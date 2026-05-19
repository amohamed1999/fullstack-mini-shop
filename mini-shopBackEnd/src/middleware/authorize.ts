import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Returns a Fastify preHandler that enforces role-based access.
 *
 * Usage:
 *   preHandler: [authenticate, authorize('admin')]
 */
export function authorize(...allowedRoles: UserRole[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(
        `Access restricted to: ${allowedRoles.join(', ')}`,
      );
    }
  };
}
