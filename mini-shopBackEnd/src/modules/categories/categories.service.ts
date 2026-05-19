import { supabaseAdmin } from '../../lib/supabase';
import { AppError, NotFoundError, ConflictError } from '../../utils/errors';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.schema';
import type { Category } from '../../types';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw new AppError(error.message, 500);
  return (data as Category[]) ?? [];
}

export async function getCategoryById(id: string): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Category');
  return data as Category;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(input)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new ConflictError('Category slug already exists');
    throw new AppError(error.message, 500);
  }

  return data as Category;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  await getCategoryById(id);

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new ConflictError('Category slug already exists');
    throw new AppError(error.message, 500);
  }

  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  await getCategoryById(id);

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
}
