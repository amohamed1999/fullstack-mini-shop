import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createOrderSchema,
  orderIdSchema,
  orderStatusSchema,
  adminOrderQuerySchema,
} from './orders.schema';
import * as ordersService from './orders.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export async function createOrder(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = createOrderSchema.parse(request.body);
  const order = await ordersService.createOrder(request.user!.id, input);
  sendCreated(reply, order);
}

export async function getMyOrders(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const orders = await ordersService.getMyOrders(request.user!.id);
  sendSuccess(reply, orders);
}

export async function getAllOrders(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = adminOrderQuerySchema.parse(request.query);
  const { items, total } = await ordersService.getAllOrders(query);
  sendPaginated(reply, items, total, query.page, query.limit);
}

export async function updateOrderStatus(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = orderIdSchema.parse(request.params);
  const input = orderStatusSchema.parse(request.body);
  const order = await ordersService.updateOrderStatus(
    id,
    input,
    request.user!.id,
    request.user!.role === 'admin',
  );
  sendSuccess(reply, order);
}
