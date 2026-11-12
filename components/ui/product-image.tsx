'use client';

import { useState, useEffect } from 'react';
import { Package, Wheat, Cpu, Shirt, Sparkles, Droplets, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: string | null;
  className?: string;
  imgClassName?: string;
  aspect?: 'square' | '4/3' | '16/10' | 'auto';
  showFallbackLabel?: boolean;
}

function getCategoryIcon(category?: string | null) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('grain') || cat.includes('pulse') || cat.includes('agri') || cat.includes('spice')) {
    return Wheat;
  }
  if (cat.includes('elect') || cat.includes('phone') || cat.includes('audio') || cat.includes('laptop')) {
    return Cpu;
  }
  if (cat.includes('textile') || cat.includes('apparel') || cat.includes('cloth')) {
    return Shirt;
  }
  if (cat.includes('oil') || cat.includes('liquid') || cat.includes('bever')) {
    return Droplets;
  }
  if (cat.includes('health') || cat.includes('care') || cat.includes('cosmetic')) {
    return Sparkles;
  }
  if (cat.includes('fmcg') || cat.includes('packaged')) {
    return ShoppingBag;
  }
  return Package;
}

export function ProductImage({
  src,
  alt,
  category,
  className,
  imgClassName,
  aspect = '4/3',
  showFallbackLabel = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setLoaded(false);
  }, [src]);

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square'
      : aspect === '16/10'
      ? 'aspect-[16/10]'
      : aspect === '4/3'
      ? 'aspect-[4/3]'
      : '';

  const FallbackIcon = getCategoryIcon(category);
  const cleanSrc = typeof src === 'string' && src.trim().length > 0 ? src.trim() : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100 dark:bg-zinc-900 flex items-center justify-center',
        aspectClass,
        className
      )}
    >
      {cleanSrc && !hasError ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200/70 dark:bg-zinc-800/70" />
          )}
          <img
            src={cleanSrc}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
              imgClassName
            )}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 dark:text-zinc-500 select-none text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-zinc-800 flex items-center justify-center">
            <FallbackIcon className="w-5 h-5" />
          </div>
          {showFallbackLabel && (
            <span className="text-[11px] font-medium line-clamp-1 max-w-[140px]">
              {category || 'Wholesale Product'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
