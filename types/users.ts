/**
 * User Types
 */

export type UserRole = 'retailer' | 'wholesaler';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  business_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  trust_score: number;
  green_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}
