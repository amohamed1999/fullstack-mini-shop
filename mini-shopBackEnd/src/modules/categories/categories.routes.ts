import { FastifyInstance } from 'fastify';
import * as controller from './categories.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', controller.listCategories);
  app.get('/:id', controller.getCategory);

  app.post(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    controller.createCategory,
  );

  app.patch(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    controller.updateCategory,
  );

  app.delete(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    controller.deleteCategory,
  );
}
