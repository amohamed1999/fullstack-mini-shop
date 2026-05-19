export interface OrderProfile {
  id: string;
  name: string;
}

export interface OrderProduct {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: OrderProduct;
}

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  profiles: OrderProfile;
  order_items: OrderItem[];
}

export interface OrdersListResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** PATCH /orders/:id/status often returns a partial order without relations. */
export function mergeOrderUpdate(existing: Order, updated: Order): Order {
  return {
    ...existing,
    ...updated,
    profiles: updated.profiles ?? existing.profiles,
    order_items: updated.order_items ?? existing.order_items,
  };
}
