import { FastifyRequest, FastifyReply } from 'fastify';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.schema';
import * as categoriesService from './categories.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

export async function listCategories(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const categories = await categoriesService.listCategories();
  sendSuccess(reply, categories);
}

export async function getCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);
  const category = await categoriesService.getCategoryById(id);
  sendSuccess(reply, category);
}

export async function createCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = createCategorySchema.parse(request.body);
  const category = await categoriesService.createCategory(input);
  sendCreated(reply, category);
}

export async function updateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);
  const input = updateCategorySchema.parse(request.body);
  const category = await categoriesService.updateCategory(id, input);
  sendSuccess(reply, category);
}

export async function deleteCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);
  await categoriesService.deleteCategory(id);
  sendNoContent(reply);
}
