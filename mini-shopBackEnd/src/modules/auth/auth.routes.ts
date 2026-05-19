import { FastifyInstance } from 'fastify';
import * as controller from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', controller.register);
  app.post('/login', controller.login);
  app.post('/forgot-password', controller.forgotPassword);

  app.get('/me', { preHandler: [authenticate] }, controller.getMe);
}
