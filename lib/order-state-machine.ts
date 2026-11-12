import { OrderStatus } from './supabase';

export const ORDER_STATES: OrderStatus[] = [
  'payment_pending',
  'payment_in_escrow',
  'shipped',
  'courier_verified',
  'delivered',
  'inspection',
  'completed',
  'disputed',
  'cancelled',
  'refunded',
  'ORDER_CREATED',
  'PAYMENT_HELD',
  'SHIPPED',
  'DELIVERED',
  'OTP_CONFIRMED',
  'INSPECTION_PENDING',
  'PAYMENT_RELEASED',
  'DISPUTED',
  'CANCELLED',
  'REFUNDED',
];

function normalizeState(status: string): string {
  const s = (status || '').trim().toLowerCase();
  switch (s) {
    case 'order_created':
    case 'payment_pending':
      return 'payment_pending';
    case 'payment_held':
    case 'payment_in_escrow':
      return 'payment_in_escrow';
    case 'shipped':
      return 'shipped';
    case 'courier_verified':
      return 'courier_verified';
    case 'delivered':
      return 'delivered';
    case 'otp_confirmed':
    case 'inspection':
    case 'inspection_pending':
      return 'inspection';
    case 'payment_released':
    case 'completed':
      return 'completed';
    case 'disputed':
      return 'disputed';
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    default:
      return s;
  }
}

const VALID_NORMALIZED_TRANSITIONS: Record<string, string[]> = {
  payment_pending: ['payment_in_escrow', 'shipped', 'cancelled'],
  payment_in_escrow: ['shipped', 'courier_verified', 'delivered', 'cancelled', 'disputed'],
  shipped: ['courier_verified', 'delivered', 'inspection', 'disputed'],
  courier_verified: ['delivered', 'inspection', 'disputed'],
  delivered: ['inspection', 'completed', 'disputed'],
  inspection: ['completed', 'disputed'],
  completed: [],
  disputed: ['completed', 'refunded'],
  cancelled: [],
  refunded: [],
};

export function validateTransition(currentStatus: OrderStatus | string, newStatus: OrderStatus | string): boolean {
  const current = normalizeState(currentStatus);
  const next = normalizeState(newStatus);
  if (current === next) return true;
  const validNextStates = VALID_NORMALIZED_TRANSITIONS[current];
  if (!validNextStates) return false;
  return validNextStates.includes(next);
}

export function getNextStepDescription(status: OrderStatus | string, role: 'retailer' | 'wholesaler'): string {
  switch (normalizeState(status)) {
    case 'payment_pending':
      return role === 'retailer' ? 'Complete escrow payment to confirm order' : 'Waiting for buyer escrow payment';
    case 'payment_in_escrow':
      return role === 'wholesaler' ? 'Pack goods, attach QR label & dispatch shipment' : 'Payment secured in escrow — awaiting dispatch';
    case 'shipped':
    case 'courier_verified':
      return role === 'retailer' ? 'Track shipment & verify OTP upon arrival' : 'In transit to buyer destination';
    case 'delivered':
      return role === 'retailer' ? 'Confirm delivery OTP & inspect goods' : 'Delivered — awaiting buyer confirmation';
    case 'inspection':
      return role === 'retailer' ? '24h inspection window active — raise dispute if damaged' : 'Inspection window active before payout';
    case 'disputed':
      return 'Under operations dispute review';
    case 'completed':
      return 'Escrow released & order completed';
    case 'cancelled':
      return 'Order cancelled';
    case 'refunded':
      return 'Escrow refunded to buyer';
    default:
      return '';
  }
}
