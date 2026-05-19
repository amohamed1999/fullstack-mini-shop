import { z } from 'zod';
import type { OrderStatus } from '../../types';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('productId must be a valid UUID'),
        quantity: z.number().int().positive('quantity must be a positive integer'),
      }),
    )
    .min(1, 'Order must contain at least one item'),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ] as const satisfies readonly OrderStatus[]),
});

export const orderIdSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const adminOrderQuerySchema = z.object({
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
