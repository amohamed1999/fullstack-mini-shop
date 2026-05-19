import { supabase, supabaseAdmin } from '../../lib/supabase';
import { AppError, ConflictError, UnauthorizedError } from '../../utils/errors';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
} from './auth.schema';
import type { Profile } from '../../types';

export async function registerUser(input: RegisterInput) {
  // 1. Create Supabase auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered')) {
      throw new ConflictError('Email is already registered');
    }
    throw new AppError(authError.message, 400);
  }

  const userId = authData.user.id;

  // 2. Create profile row
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: userId, name: input.name, role: 'customer' })
    .select()
    .single();

  if (profileError) {
    // Roll back auth user to keep data consistent
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new AppError('Failed to create user profile', 500);
  }

  // 3. Sign in to get tokens
  const { data: session, error: sessionError } =
    await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

  if (sessionError || !session.session) {
    throw new AppError('Registration succeeded but sign-in failed', 500);
  }

  return {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    user: profile as Profile,
  };
}

export async function loginUser(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new AppError('User profile not found', 500);
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: profile as Profile,
  };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);

  if (error) {
    throw new AppError(error.message, 400);
  }
}

export async function getMe(userId: string): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new AppError('Profile not found', 404);
  }

  return data as Profile;
}
