import { FastifyReply } from 'fastify';

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
): void {
  reply.status(statusCode).send({ success: true, data });
}

export function sendCreated<T>(reply: FastifyReply, data: T): void {
  sendSuccess(reply, data, 201);
}

export function sendNoContent(reply: FastifyReply): void {
  reply.status(204).send();
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function sendPaginated<T>(
  reply: FastifyReply,
  items: T[],
  total: number,
  page: number,
  limit: number,
): void {
  const result: PaginatedResult<T> = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  sendSuccess(reply, result);
}
