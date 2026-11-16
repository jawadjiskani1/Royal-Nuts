export interface CustomerProfile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}
export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  quantity: number;
  price: number;
}
export interface CustomerOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_fee: number;
  items: OrderItem[];
}
