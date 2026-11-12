// Supabase Database Types
export type UserRole = 'retailer' | 'wholesaler' | 'employee' | 'founder';

export type OrderStatus =
  | 'ORDER_CREATED'
  | 'PAYMENT_HELD'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'OTP_CONFIRMED'
  | 'INSPECTION_PENDING'
  | 'PAYMENT_RELEASED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'payment_pending'
  | 'payment_in_escrow'
  | 'shipped'
  | 'courier_verified'
  | 'delivered'
  | 'inspection'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          name: string;
          phone: string | null;
          business_name: string;
          location: string;
          trust_score: number;
          total_orders: number;
          successful_orders: number;
          disputed_orders: number;
          is_low_trust?: boolean;
          gst_number?: string | null;
          gst_verified?: boolean;
          profile_image_url?: string | null;
          business_type?: string | null;
          business_address?: string | null;
          pin_code?: string | null;
          business_description?: string | null;
          years_in_business?: number | null;
          min_order_quantity?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          category: string;
          base_price: number;
          demand_score: number;
          demand_level: 'High' | 'Medium' | 'Low';
          expected_margin: number;
          supplier_count: number;
          image_url: string | null;
          description: string;
          unit: string;
          min_order_quantity: number;
          region_boost: number;
          season_factor: number;
          recommendation_reason: string | null;
          is_active: boolean;
          batch_number?: string | null;
          expiry_date?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_amount: number;
          status: OrderStatus;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          otp: string | null;
          otp_verified: boolean;
          inspection_deadline: string | null;
          dispute_reason: string | null;
          dispute_evidence: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          raised_by: string;
          reason: string;
          evidence_urls: string[];
          status: 'pending' | 'under_review' | 'resolved' | 'rejected';
          resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['disputes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['disputes']['Insert']>;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>;
      };
    };
  };
}

export type User = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Dispute = Database['public']['Tables']['disputes']['Row'];
