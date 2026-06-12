// src/pages/orders/orders.service.ts

import API from "../../services/api";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUND_PENDING";

export interface OrderItem {
  id: number;
  medicine_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  requires_prescription: boolean;
}

export interface Order {
  id: number;
  order_id: string;
  user_id: number;
  full_name: string;
  mobile: string;
  address: string;
  items: OrderItem[];
  total_amount: number;
  payment_mode: "COD" | "ONLINE"; // depending on seed data
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  prescription_image?: string | null;
  shop_id?: number | null;
  cancellation_reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  orders: Order[];
}

export interface OrdersFilters {
  order_status?: string;
  payment_status?: string;
  shop_id?: number;
  user_id?: number;
  page?: number;
  limit?: number;
}

// 🔹 Get All Orders: GET /api/orders
export const getOrders = async (filters: OrdersFilters = {}): Promise<{ data: OrdersResponse }> => {
  const cleanFilters: any = {};
  if (filters.order_status && filters.order_status !== "All") {
    cleanFilters.order_status = filters.order_status;
  }
  if (filters.payment_status && filters.payment_status !== "All") {
    cleanFilters.payment_status = filters.payment_status;
  }
  if (filters.shop_id) cleanFilters.shop_id = filters.shop_id;
  if (filters.user_id) cleanFilters.user_id = filters.user_id;
  if (filters.page) cleanFilters.page = filters.page;
  if (filters.limit) cleanFilters.limit = filters.limit;

  const res = await API.get("/orders", { params: cleanFilters });
  if (res.data && res.data.success && res.data.data) {
    return { data: res.data.data };
  }
  throw new Error("Invalid API format received");
};

// 🔹 Update Order Status: PATCH /api/orders/:id/status (Admin/Stock only)
export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  shopId?: number
): Promise<{ message: string; data: Order }> => {
  const payload: any = { status };
  if (shopId) payload.shop_id = shopId;

  const res = await API.patch(`/orders/${id}/status`, payload);
  if (res.data && res.data.success) {
    return res.data;
  }
  throw new Error("Failed to update status");
};

// 🔹 Update Payment Status: PATCH /api/orders/:id/payment (Admin only)
export const updatePaymentStatus = async (
  id: number,
  status: PaymentStatus
): Promise<{ message: string; data: Order }> => {
  const res = await API.patch(`/orders/${id}/payment`, { status });
  if (res.data && res.data.success) {
    return res.data;
  }
  throw new Error("Failed to update payment status");
};

// 🔹 Cancel Order: POST /api/orders/:id/cancel (User/Admin/Stock)
export const cancelOrder = async (
  id: number,
  reason: string
): Promise<{ message: string; data: Order }> => {
  const res = await API.post(`/orders/${id}/cancel`, { reason });
  if (res.data && res.data.success) {
    return res.data;
  }
  throw new Error("Failed to cancel order");
};

// 🔹 Review Prescription: PATCH /api/orders/:id/review-prescription (Admin)
export const reviewPrescription = async (
  id: number,
  items: { id: number; quantity: number }[],
  shopId?: number
): Promise<{ message: string; data: Order }> => {
  const payload: any = { items };
  if (shopId) payload.shop_id = shopId;

  const res = await API.patch(`/orders/${id}/review-prescription`, payload);
  if (res.data && res.data.success) {
    return res.data;
  }
  throw new Error("Failed to review prescription");
};

