'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ variant = 'full', size = 'md', className }: BrandLogoProps) {
  const heightMap = {
    sm: 'h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
  };

  if (variant === 'icon') {
    return (
      <span className={cn('inline-flex items-center shrink-0 select-none', className)}>
        <Image
          src="/tradigoo-icon-transparent.png"
          alt="Tradigoo"
          width={36}
          height={36}
          referrerPolicy="no-referrer"
          className={cn(heightMap[size], 'w-auto object-contain')}
          priority
        />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2 shrink-0 select-none', className)}>
      <Image
        src="/tradigoo-icon-transparent.png"
        alt="Tradigoo"
        width={34}
        height={34}
        referrerPolicy="no-referrer"
        className={cn(heightMap[size], 'w-auto object-contain')}
        priority
      />
      <span className="font-display font-bold tracking-tight text-lg sm:text-xl text-slate-900 dark:text-white leading-none">
        Tradigoo
      </span>
    </span>
  );
}
