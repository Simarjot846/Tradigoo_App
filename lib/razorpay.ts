import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance (server-side only)
export function getRazorpayInstance() {
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }

  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('Razorpay webhook secret not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Create Razorpay order
export interface CreateOrderParams {
  amount: number; // in paise (₹1 = 100 paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const razorpay = getRazorpayInstance();

  const options = {
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
    payment_capture: 0, // Manual capture for escrow (0 = manual, 1 = automatic)
  };

  return await razorpay.orders.create(options);
}

// Capture payment (release from escrow)
export async function capturePayment(paymentId: string, amount: number) {
  const razorpay = getRazorpayInstance();

  return await razorpay.payments.capture(paymentId, amount, 'INR');
}

// Refund payment
export async function refundPayment(paymentId: string, amount?: number) {
  const razorpay = getRazorpayInstance();

  const options: any = {
    payment_id: paymentId,
  };

  if (amount) {
    options.amount = amount;
  }

  return await razorpay.payments.refund(paymentId, options);
}

// Fetch payment details
export async function fetchPayment(paymentId: string) {
  const razorpay = getRazorpayInstance();
  return await razorpay.payments.fetch(paymentId);
}

// Fetch order details
export async function fetchOrder(orderId: string) {
  const razorpay = getRazorpayInstance();
  return await razorpay.orders.fetch(orderId);
}

// Types for Razorpay responses
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  email: string;
  contact: string;
  created_at: number;
}
