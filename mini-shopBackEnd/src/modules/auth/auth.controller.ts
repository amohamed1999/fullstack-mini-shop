import { FastifyRequest, FastifyReply } from 'fastify';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from './auth.schema';
import * as authService from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = registerSchema.parse(request.body);
  const result = await authService.registerUser(input);
  sendCreated(reply, result);
}

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = loginSchema.parse(request.body);
  const result = await authService.loginUser(input);
  sendSuccess(reply, result);
}

export async function forgotPassword(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const input = forgotPasswordSchema.parse(request.body);
  await authService.forgotPassword(input);
  sendSuccess(reply, { message: 'Password reset email sent' });
}

export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const profile = await authService.getMe(request.user!.id);
  sendSuccess(reply, profile);
}
