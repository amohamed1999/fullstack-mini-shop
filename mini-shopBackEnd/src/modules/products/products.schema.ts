import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().uuid('category must be a UUID').optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});

export const productIdSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Price must be positive'),
  category_id: z.string().uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
