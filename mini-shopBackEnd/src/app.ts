import Fastify from 'fastify';
import multipart from '@fastify/multipart';

import { registerSecurityPlugins } from './plugins/security';
import { registerErrorHandler } from './plugins/errorHandler';

import { authRoutes } from './modules/auth/auth.routes';
import { productRoutes } from './modules/products/products.routes';
import { orderRoutes } from './modules/orders/orders.routes';
import { categoryRoutes } from './modules/categories/categories.routes';
import { userRoutes } from './modules/users/users.routes';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ── Security ──────────────────────────────────────────────────────────────
  await registerSecurityPlugins(app);

  // ── Multipart ─────────────────────────────────────────────────────────────
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
      files: 1,
    },
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(productRoutes, { prefix: '/products' });
  await app.register(orderRoutes, { prefix: '/orders' });
  await app.register(categoryRoutes, { prefix: '/categories' });
  await app.register(userRoutes, { prefix: '/users' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── Error handler (must be registered last) ───────────────────────────────
  registerErrorHandler(app);

  return app;
}
