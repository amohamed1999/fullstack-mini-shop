import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError, NotFoundError } from '../../utils/errors';
import { getPaginationRange } from '../../utils/pagination';

const paginationSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});

const userIdSchema = z.object({ id: z.string().uuid() });

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // GET /users  — admin only
  app.get(
    '/',
    { preHandler: [authenticate, authorize('admin')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page, limit } = paginationSchema.parse(request.query);
      const { from, to } = getPaginationRange(page, limit);

      const { data, error, count } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw new AppError(error.message, 500);

      sendPaginated(reply, data ?? [], count ?? 0, page, limit);
    },
  );

  // GET /users/:id  — admin only
  app.get(
    '/:id',
    { preHandler: [authenticate, authorize('admin')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = userIdSchema.parse(request.params);

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) throw new NotFoundError('User');

      sendSuccess(reply, data);
    },
  );
}
