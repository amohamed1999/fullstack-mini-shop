import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

function httpStatusText(code: number): string {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return map[code] ?? 'Error';
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (
      error: FastifyError | AppError | ZodError | Error,
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      request.log.error(error);

      // Zod validation errors
      if (error instanceof ZodError) {
        const response: ErrorResponse = {
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors.map((e) => e.message).join('; '),
        };
        return reply.status(400).send(response);
      }

      // Our custom application errors
      if (error instanceof AppError) {
        const response: ErrorResponse = {
          statusCode: error.statusCode,
          error: httpStatusText(error.statusCode),
          message: error.message,
        };
        return reply.status(error.statusCode).send(response);
      }

      // Fastify built-in errors (e.g. FST_ERR_*)
      const fastifyError = error as FastifyError;
      if (fastifyError.statusCode) {
        const response: ErrorResponse = {
          statusCode: fastifyError.statusCode,
          error: httpStatusText(fastifyError.statusCode),
          message: fastifyError.message,
        };
        return reply.status(fastifyError.statusCode).send(response);
      }

      // Unexpected errors — never leak internals
      const response: ErrorResponse = {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      };
      return reply.status(500).send(response);
    },
  );
}
