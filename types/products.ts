/**
 * Product Types
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  image_url?: string;
  seller_id: string;
  stock_quantity: number;
  min_order_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithSeller extends Product {
  seller: {
    id: string;
    business_name: string;
    trust_score: number;
    green_score: number;
  };
}

export type ProductCategory = 
  | 'Grains & Cereals'
  | 'Pulses & Lentils'
  | 'Spices'
  | 'Oils & Ghee'
  | 'Dry Fruits'
  | 'Dairy Products'
  | 'Beverages'
  | 'Snacks'
  | 'Other';
