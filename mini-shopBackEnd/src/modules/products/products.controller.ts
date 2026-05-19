import { FastifyRequest, FastifyReply } from 'fastify';
import {
  productQuerySchema,
  productIdSchema,
  createProductSchema,
  updateProductSchema,
} from './products.schema';
import * as productsService from './products.service';
import { uploadProductImage } from '../../utils/storage';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../utils/response';
import { AppError } from '../../utils/errors';

export async function listProducts(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = productQuerySchema.parse(request.query);
  const isAdmin = request.user?.role === 'admin';
  const { items, total } = await productsService.listProducts(query, isAdmin);
  sendPaginated(reply, items, total, query.page, query.limit);
}

export async function getProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const product = await productsService.getProductById(id);
  sendSuccess(reply, product);
}

export async function createProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parts = request.parts();

  let imageUrl: string | undefined;
  const fields: Record<string, unknown> = {};

  for await (const part of parts) {
    if (part.type === 'file') {
      imageUrl = await uploadProductImage(part);
    } else {
      const value = (part as { value: string }).value;
      // Coerce numeric fields
      if (part.fieldname === 'price') {
        fields[part.fieldname] = parseFloat(value);
      } else {
        fields[part.fieldname] = value;
      }
    }
  }

  if (!imageUrl) {
    throw new AppError('Product image is required', 400);
  }

  const input = createProductSchema.parse(fields);
  const product = await productsService.createProduct(input, imageUrl);
  sendCreated(reply, product);
}

export async function updateProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);

  // Support both JSON and multipart
  const contentType = request.headers['content-type'] ?? '';
  let imageUrl: string | undefined;
  let fields: Record<string, unknown> = {};

  if (contentType.includes('multipart')) {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        imageUrl = await uploadProductImage(part);
      } else {
        const value = (part as { value: string }).value;
        if (part.fieldname === 'price') {
          fields[part.fieldname] = parseFloat(value);
        } else {
          fields[part.fieldname] = value;
        }
      }
    }
  } else {
    fields = request.body as Record<string, unknown>;
  }

  const input = updateProductSchema.parse(fields);
  const product = await productsService.updateProduct(id, input, imageUrl);
  sendSuccess(reply, product);
}

export async function deleteProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  await productsService.softDeleteProduct(id);
  sendNoContent(reply);
}
