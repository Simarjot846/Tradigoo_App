'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { ShoppingCart, ShieldCheck, Truck, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: any;
  addToCart: (id: string, qty: number) => void;
}

const ProductCard = memo(({ product, addToCart }: ProductCardProps) => {
  const router = useRouter();
  const sellerName = product.seller?.business_name || product.seller?.name || 'Verified Supplier';
  const gstVerified = Boolean(product.seller?.gst_verified);
  const moq = Math.max(1, Number(product.min_order_quantity || 1));

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
    >
      {/* Image Header */}
      <div className="relative border-b border-slate-100 dark:border-zinc-800">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          aspect="4/3"
          imgClassName="group-hover:scale-105 transition-transform duration-300"
        />

        {gstVerified && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-white/95 dark:bg-zinc-950/90 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>GST Verified</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-10 bg-slate-900/80 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-md tabular-nums">
          MOQ: {moq} {product.unit || 'unit'}
        </div>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 truncate">
            {product.category || 'Wholesale'}
          </p>

          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{sellerName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Escrow protected · 2–4 day dispatch</span>
          </div>
        </div>

        {/* Pricing + Actions */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 mt-auto">
          <div className="flex items-baseline gap-1 mb-2.5">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              ₹{Number(product.base_price || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              / {product.unit || 'unit'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id, moq);
                router.push('/cart');
              }}
              className="flex-1 h-8 sm:h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg"
            >
              Buy Now
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id, moq);
              }}
              className="h-8 sm:h-9 px-2.5 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg shrink-0"
              aria-label="Add to cart"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
