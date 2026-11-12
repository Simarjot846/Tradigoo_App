/**
 * Order Types
 */

export type OrderStatus = 
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: string;
  delivery_otp?: string;
  verification_token?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  product: {
    name: string;
    image_url?: string;
  };
  seller: {
    business_name: string;
  };
  buyer: {
    business_name: string;
  };
}
