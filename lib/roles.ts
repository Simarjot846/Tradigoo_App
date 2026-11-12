import type { UserRole } from './supabase';

export const FOUNDER_EMAIL = 'simarjotkaur514@gmail.com';
export const EMPLOYEE_EMAIL = 'tradigoobackendemployee@gmail.com';

export function resolveEffectiveRole(email?: string | null, profileRole?: string | null): UserRole {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (cleanEmail === FOUNDER_EMAIL) {
    return 'founder';
  }
  if (cleanEmail === EMPLOYEE_EMAIL) {
    return 'employee';
  }
  if (profileRole === 'wholesaler') return 'wholesaler';
  if (profileRole === 'retailer') return 'retailer';
  // Never allow non-designated emails to inherit founder/employee roles unless explicitly verified
  return 'retailer';
}

export function isPrivilegedRole(role?: string | null): boolean {
  return role === 'founder' || role === 'employee';
}

export function getRoleDisplayLabel(role?: string | null): string {
  switch (role) {
    case 'founder':
      return 'Founder';
    case 'employee':
      return 'Operations Staff';
    case 'wholesaler':
      return 'Wholesaler';
    default:
      return 'Retailer';
  }
}
