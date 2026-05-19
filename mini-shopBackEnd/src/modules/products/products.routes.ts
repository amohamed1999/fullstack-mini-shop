import { FastifyInstance } from 'fastify';
import * as controller from './products.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export async function productRoutes(app: FastifyInstance): Promise<void> {
  // Public / customer routes
  app.get('/', controller.listProducts);
  app.get('/:id', controller.getProduct);

  // Admin-only routes
  app.post(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    controller.createProduct,
  );

  app.patch(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    controller.updateProduct,
  );

  app.delete(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    controller.deleteProduct,
  );
}
