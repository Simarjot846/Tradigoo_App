/**
 * Category-aware GST & Pricing Calculator for Indian B2B Wholesale Orders
 */

const CATEGORY_GST_RATES: Record<string, number> = {
  // 5% GST slab (Essential staples & agricultural commodities)
  grains: 5,
  'grains & cereals': 5,
  pulses: 5,
  'pulses & lentils': 5,
  flours: 5,
  oils: 5,
  'oils & ghee': 5,
  spices: 5,
  sweeteners: 5,
  'dairy products': 5,
  dairy: 5,

  // 12% GST slab (Apparel, personal care, packaged goods)
  fashion: 12,
  clothing: 12,
  beauty: 12,
  'body care': 12,
  skincare: 12,
  'bath products': 12,
  beverages: 12,
  'dry fruits': 12,
  snacks: 12,

  // 18% GST slab (Electronics, cookware, general B2B)
  electronics: 18,
  'home & kitchen': 18,
  general: 18,
};

export function getGstRateForCategory(category?: string | null): number {
  if (!category) return 5;
  const normalized = category.trim().toLowerCase();
  if (normalized in CATEGORY_GST_RATES) {
    return CATEGORY_GST_RATES[normalized];
  }
  if (normalized.includes('grain') || normalized.includes('dal') || normalized.includes('flour') || normalized.includes('spice') || normalized.includes('oil')) {
    return 5;
  }
  if (normalized.includes('cloth') || normalized.includes('fashion') || normalized.includes('care') || normalized.includes('skin') || normalized.includes('beauty')) {
    return 12;
  }
  return 18;
}

export interface TaxBreakdownItem {
  rate: number;
  taxableAmount: number;
  gstAmount: number;
}

export interface CartTotalsSummary {
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  breakdown: TaxBreakdownItem[];
}

export function calculateItemPricing(unitPrice: number, quantity: number, category?: string | null) {
  const safePrice = Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0;
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
  const gstRate = getGstRateForCategory(category);
  const taxableAmount = Math.round(safePrice * safeQty * 100) / 100;
  const gstAmount = Math.round(taxableAmount * (gstRate / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;
  return { gstRate, taxableAmount, gstAmount, totalAmount };
}

export function calculateCartTotals(
  items: Array<{ quantity: number; product?: { base_price?: number; category?: string | null } | null }>
): CartTotalsSummary {
  const rateBuckets = new Map<number, { taxableAmount: number; gstAmount: number }>();
  let subtotal = 0;
  let gstTotal = 0;

  for (const item of items) {
    const unitPrice = Number(item.product?.base_price || 0);
    const { gstRate, taxableAmount, gstAmount } = calculateItemPricing(
      unitPrice,
      item.quantity,
      item.product?.category
    );
    subtotal += taxableAmount;
    gstTotal += gstAmount;

    const existing = rateBuckets.get(gstRate) || { taxableAmount: 0, gstAmount: 0 };
    rateBuckets.set(gstRate, {
      taxableAmount: Math.round((existing.taxableAmount + taxableAmount) * 100) / 100,
      gstAmount: Math.round((existing.gstAmount + gstAmount) * 100) / 100,
    });
  }

  const breakdown: TaxBreakdownItem[] = Array.from(rateBuckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, vals]) => ({ rate, ...vals }));

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstTotal: Math.round(gstTotal * 100) / 100,
    grandTotal: Math.round((subtotal + gstTotal) * 100) / 100,
    breakdown,
  };
}
