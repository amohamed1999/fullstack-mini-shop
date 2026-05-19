import { supabaseAdmin } from '../../lib/supabase';
import { NotFoundError, AppError } from '../../utils/errors';
import { getPaginationRange } from '../../utils/pagination';
import type {
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from './products.schema';
import type { Product } from '../../types';

export async function listProducts(
  query: ProductQuery,
  isAdmin: boolean,
): Promise<{ items: Product[]; total: number }> {
  const { from, to } = getPaginationRange(query.page, query.limit);

  let q = supabaseAdmin
    .from('products')
    .select('*, categories(id, name, slug)', { count: 'exact' });

  if (!isAdmin) {
    q = q.eq('is_active', true);
  }

  if (query.search) {
    q = q.ilike('name', `%${query.search}%`);
  }

  if (query.category) {
    q = q.eq('category_id', query.category);
  }

  const { data, error, count } = await q.range(from, to);

  if (error) throw new AppError(error.message, 500);

  return { items: (data as Product[]) ?? [], total: count ?? 0 };
}

export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Product');

  return data as Product;
}

export async function createProduct(
  input: CreateProductInput,
  imageUrl?: string,
): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ ...input, image_url: imageUrl ?? null })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  return data as Product;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  imageUrl?: string,
): Promise<Product> {
  await getProductById(id); // ensure exists

  const updates: Partial<Product> & { image_url?: string } = { ...input };
  if (imageUrl !== undefined) updates.image_url = imageUrl;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  return data as Product;
}

export async function softDeleteProduct(id: string): Promise<void> {
  await getProductById(id); // ensure exists

  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
}
