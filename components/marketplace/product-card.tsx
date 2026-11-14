'use client';

import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { calculateItemPricing } from '@/lib/tax';
import { useAuth } from '@/lib/auth-context';
import { ShoppingCart, ShieldCheck, Truck, Building2, MapPin, Award, Zap, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductCardProps {
  product: any;
  addToCart: (id: string, qty: number) => Promise<boolean> | void;
}

const ProductCard = memo(({ product, addToCart }: ProductCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const sellerName = product.seller?.business_name || product.seller?.name || 'Verified Supplier';
  const sellerLocation = product.seller?.location;
  const sellerTrust = Number(product.seller?.trust_score ?? 500);
  const gstVerified = Boolean(product.seller?.gst_verified);
  const moq = Math.max(1, Number(product.min_order_quantity || 1));
  const unitPrice = Number(product.base_price || 0);
  const pricing = calculateItemPricing(unitPrice, moq, product.category);

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      const ok = await addToCart(product.id, moq);
      if (ok !== false) {
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (user?.id && product.seller_id === user.id) {
      toast.error('You cannot place an order for your own product listing.');
      return;
    }

    if (user?.role === 'wholesaler') {
      toast.info('Switch to a Retailer account to place wholesale orders.');
      return;
    }

    const expectedMarginPct = Number(product.expected_margin || 18);
    const pendingOrder = {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      seller_id: product.seller_id,
      quantity: moq,
      unit_price: unitPrice,
      unit: product.unit || 'unit',
      image_url: product.image_url || null,
      subtotal: pricing.taxableAmount,
      gst_rate: pricing.gstRate,
      gst_amount: pricing.gstAmount,
      total_amount: pricing.totalAmount,
      expected_profit: Math.round(pricing.taxableAmount * (expectedMarginPct / 100)),
    };

    try {
      sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
    } catch {}

    if (!user) {
      toast.info('Please sign in to complete your escrow checkout.');
      router.push('/auth/login?redirect=/order/confirm');
      return;
    }

    router.push('/order/confirm');
  };

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/60 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-full"
    >
      {/* Image Header */}
      <div className="relative border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          aspect="4/3"
          imgClassName="group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
          {gstVerified ? (
            <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-zinc-950/90 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>GST Verified</span>
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 bg-slate-900/85 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs tabular-nums">
            <Award className="w-3 h-3 shrink-0" />
            <span>{sellerTrust}</span>
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
          <span className="bg-slate-900/85 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-md tabular-nums">
            MOQ: {moq} {product.unit || 'unit'}
          </span>
          <span className="bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700">
            {pricing.gstRate}% GST
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 truncate">
            {product.category || 'Wholesale'}
          </p>

          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.4rem]">
            {product.name}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate font-medium">{sellerName}</span>
            </div>

            {sellerLocation && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                <span className="truncate">{sellerLocation}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Escrow · 24h inspection</span>
            </div>
          </div>
        </div>

        {/* Pricing + Actions */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 mt-auto">
          <div className="flex items-baseline justify-between gap-1 mb-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                ₹{unitPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                / {product.unit || 'unit'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2.5 tabular-nums truncate">
            Min lot ({moq}): ₹{pricing.taxableAmount.toLocaleString('en-IN')} + GST
          </p>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={adding}
              onClick={handleAddToCartClick}
              className="h-8 sm:h-9 px-2.5 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-lg text-xs font-semibold gap-1.5 w-full"
              aria-label="Add to Cart"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleBuyNowClick}
              className="h-8 sm:h-9 px-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold text-xs rounded-lg gap-1.5 w-full"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Buy Now</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
