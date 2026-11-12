import { User } from './supabase';

// Legacy Product type for mock data (without production fields)
export interface MockProduct {
  id: string;
  name: string;
  category: string;
  base_price: number;
  demand_score: number;
  demand_level: 'High' | 'Medium' | 'Low';
  expected_margin: number;
  supplier_count: number;
  image_url: string;
  description: string;
  unit: string;
  min_order_quantity: number;
  region_boost: number;
  season_factor: number;
  recommendation_reason: string;
}

export const mockProducts: MockProduct[] = [
  // --- FASHION ---
  {
    id: '21',
    name: 'Men\'s Cotton Shirt',
    category: 'Fashion',
    base_price: 450,
    demand_score: 85,
    demand_level: 'High',
    expected_margin: 30,
    supplier_count: 15,
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
    description: 'Premium quality cotton shirt, various sizes',
    unit: 'piece',
    min_order_quantity: 10,
    region_boost: 10,
    season_factor: 8,
    recommendation_reason: 'Trending summer wear. High margin apparel item.'
  },
  {
    id: '22',
    name: 'Silk Saree',
    category: 'Fashion',
    base_price: 1200,
    demand_score: 78,
    demand_level: 'Medium',
    expected_margin: 35,
    supplier_count: 8,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    description: 'Traditional silk saree with gold border',
    unit: 'piece',
    min_order_quantity: 5,
    region_boost: 15,
    season_factor: 20,
    recommendation_reason: 'Wedding season favorite. High ticket item.'
  },
  // --- BODY CARE ---
  {
    id: '23',
    name: 'Moisturizing Lotion',
    category: 'Beauty',
    base_price: 180,
    demand_score: 82,
    demand_level: 'High',
    expected_margin: 25,
    supplier_count: 10,
    image_url: '/products/moisturizing-lotion.jpg',
    description: '200ml cocoa butter moisturizing lotion',
    unit: 'bottle',
    min_order_quantity: 24,
    region_boost: 5,
    season_factor: 15,
    recommendation_reason: 'Winter care essential. Recurring purchase.'
  },
  {
    id: '24',
    name: 'Sunscreen SPF 50',
    category: 'Beauty',
    base_price: 350,
    demand_score: 88,
    demand_level: 'High',
    expected_margin: 28,
    supplier_count: 7,
    image_url: '/products/sunscreen-spf-50.jpg',
    description: '100ml matte finish sunscreen',
    unit: 'tube',
    min_order_quantity: 20,
    region_boost: 12,
    season_factor: 18,
    recommendation_reason: 'Summer essential. Growing skincare awareness.'
  },
  // --- BATH PRODUCTS ---
  {
    id: '25',
    name: 'Herbal Body Wash',
    category: 'Bath Products',
    base_price: 120,
    demand_score: 75,
    demand_level: 'Medium',
    expected_margin: 20,
    supplier_count: 12,
    image_url: '/products/herbal-body-wash.jpg',
    description: '250ml herbal body wash with neem',
    unit: 'bottle',
    min_order_quantity: 30,
    region_boost: 8,
    season_factor: 5,
    recommendation_reason: 'Daily hygiene product. Steady demand.'
  },
  {
    id: '26',
    name: 'Handmade Lavender Soap',
    category: 'Bath Products',
    base_price: 60,
    demand_score: 70,
    demand_level: 'Medium',
    expected_margin: 30,
    supplier_count: 20,
    image_url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1000&auto=format&fit=crop',
    description: '100g organic handmade soap',
    unit: 'bar',
    min_order_quantity: 50,
    region_boost: 6,
    season_factor: 4,
    recommendation_reason: 'Premium niche product. Good impulse buy.'
  },
  // --- ELECTRONICS ---
  {
    id: '27',
    name: 'Smart Fitness Band',
    category: 'Electronics',
    base_price: 1200,
    demand_score: 90,
    demand_level: 'High',
    expected_margin: 15,
    supplier_count: 5,
    image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=1000&auto=format&fit=crop',
    description: 'Waterproof fitness tracker with heart rate monitor',
    unit: 'piece',
    min_order_quantity: 5,
    region_boost: 10,
    season_factor: 5,
    recommendation_reason: 'Tech trend. High value, moderate volume.'
  },
  {
    id: '28',
    name: 'True Wireless Earbuds',
    category: 'Electronics',
    base_price: 999,
    demand_score: 95,
    demand_level: 'High',
    expected_margin: 18,
    supplier_count: 8,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop',
    description: 'Bluetooth 5.0 earbuds with charging case',
    unit: 'piece',
    min_order_quantity: 10,
    region_boost: 12,
    season_factor: 8,
    recommendation_reason: 'Best seller in accessories. High youth demand.'
  },
  {
    id: '29',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    base_price: 134900,
    demand_score: 98,
    demand_level: 'High',
    expected_margin: 8,
    supplier_count: 25,
    image_url: '/products/iphone-15-pro.jpg',
    description: '128GB, Natural Titanium. Latest flagship.',
    unit: 'piece',
    min_order_quantity: 2,
    region_boost: 20,
    season_factor: 10,
    recommendation_reason: 'Top tier flagship. High revenue generator.'
  },
  {
    id: '30',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Electronics',
    base_price: 129999,
    demand_score: 95,
    demand_level: 'High',
    expected_margin: 10,
    supplier_count: 20,
    image_url: '/products/samsung-s24-ultra.jpg',
    description: 'AI-powered smartphone with S-Pen',
    unit: 'piece',
    min_order_quantity: 2,
    region_boost: 18,
    season_factor: 10,
    recommendation_reason: 'Best Android flagship. High corporate demand.'
  },
  // --- HOME & KITCHEN ---
  {
    id: '31',
    name: 'Non-Stick Cookware Set',
    category: 'Home & Kitchen',
    base_price: 2499,
    demand_score: 80,
    demand_level: 'Medium',
    expected_margin: 25,
    supplier_count: 15,
    image_url: '/products/cookware-set.jpg',
    description: '3-piece induction friendly cookware set',
    unit: 'set',
    min_order_quantity: 5,
    region_boost: 8,
    season_factor: 12,
    recommendation_reason: 'Household staple. Consistent sales.'
  },
  {
    id: '32',
    name: 'SS Water Bottle',
    category: 'Home & Kitchen',
    base_price: 350,
    demand_score: 85,
    demand_level: 'High',
    expected_margin: 40,
    supplier_count: 30,
    image_url: '/products/water-bottle.jpg',
    description: '1 Litre insulated stainless steel bottle',
    unit: 'piece',
    min_order_quantity: 20,
    region_boost: 15,
    season_factor: 25,
    recommendation_reason: 'Eco-friendly trend. High student demand.'
  },
  {
    id: '33',
    name: 'Cotton Double Bed Sheet',
    category: 'Home & Kitchen',
    base_price: 899,
    demand_score: 75,
    demand_level: 'Medium',
    expected_margin: 30,
    supplier_count: 10,
    image_url: '/products/bed-sheet.jpg',
    description: '100% Cotton with 2 pillow covers',
    unit: 'piece',
    min_order_quantity: 10,
    region_boost: 5,
    season_factor: 8,
    recommendation_reason: 'Home improvement essential.'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'retailer@demo.com',
    role: 'retailer',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    business_name: 'Kumar General Store',
    location: 'Mumbai, Maharashtra',
    trust_score: 850,
    total_orders: 10,
    successful_orders: 9,
    disputed_orders: 0,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'wholesaler@demo.com',
    role: 'wholesaler',
    name: 'Amit Patel',
    phone: '+91 98765 43211',
    business_name: 'Patel Wholesale Traders',
    location: 'Ahmedabad, Gujarat',
    trust_score: 920,
    total_orders: 50,
    successful_orders: 48,
    disputed_orders: 1,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  }
];


