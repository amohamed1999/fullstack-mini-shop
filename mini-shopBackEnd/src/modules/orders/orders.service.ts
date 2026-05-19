import { supabaseAdmin } from '../../lib/supabase';
import { AppError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { getPaginationRange } from '../../utils/pagination';
import type {
  CreateOrderInput,
  OrderStatusInput,
  AdminOrderQuery,
} from './orders.schema';
import type { Order, OrderItem, Product } from '../../types';

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<Order & { items: OrderItem[] }> {
  const productIds = input.items.map((i) => i.productId);

  // 1. Validate all products exist and are active
  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, price, is_active')
    .in('id', productIds);

  if (prodError) throw new AppError(prodError.message, 500);

  const productMap = new Map<string, { price: number }>();
  for (const p of products as Pick<Product, 'id' | 'price' | 'is_active'>[]) {
    if (!p.is_active) {
      throw new AppError(`Product ${p.id} is not available`, 400);
    }
    productMap.set(p.id, { price: p.price });
  }

  const missingId = productIds.find((id) => !productMap.has(id));
  if (missingId) throw new NotFoundError(`Product ${missingId}`);

  // 2. Calculate total server-side
  const totalAmount = input.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  // 3. Insert order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({ user_id: userId, total_amount: totalAmount, status: 'pending' })
    .select()
    .single();

  if (orderError) throw new AppError(orderError.message, 500);

  // 4. Insert order items
  const orderItems = input.items.map((item) => ({
    order_id: (order as Order).id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: productMap.get(item.productId)!.price,
  }));

  const { data: insertedItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems)
    .select();

  if (itemsError) throw new AppError(itemsError.message, 500);

  return { ...(order as Order), items: insertedItems as OrderItem[] };
}

// ─── My Orders ────────────────────────────────────────────────────────────────

export async function getMyOrders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        products ( id, name, image_url, price )
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  return data;
}

// ─── Admin: All Orders ────────────────────────────────────────────────────────

export async function getAllOrders(query: AdminOrderQuery) {
  const { from, to } = getPaginationRange(query.page, query.limit);

  let q = supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      profiles ( id, name ),
      order_items (
        *,
        products ( id, name )
      )
    `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (query.status) {
    q = q.eq('status', query.status);
  }

  const { data, error, count } = await q.range(from, to);

  if (error) throw new AppError(error.message, 500);

  return { items: data ?? [], total: count ?? 0 };
}

// ─── Admin: Update Order Status ───────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  input: OrderStatusInput,
  requestingUserId: string,
  isAdmin: boolean,
): Promise<Order> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !existing) throw new NotFoundError('Order');

  if (!isAdmin && (existing as Order).user_id !== requestingUserId) {
    throw new ForbiddenError();
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: input.status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  return data as Order;
}
