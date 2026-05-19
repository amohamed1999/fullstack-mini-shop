import { FastifyInstance } from 'fastify';
import * as controller from './orders.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/',
    { preHandler: [authenticate] },
    controller.createOrder,
  );

  app.get(
    '/my',
    { preHandler: [authenticate] },
    controller.getMyOrders,
  );

  app.get(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    controller.getAllOrders,
  );

  app.patch(
    '/:id/status',
    { preHandler: [authenticate, authorize('admin')] },
    controller.updateOrderStatus,
  );
}
