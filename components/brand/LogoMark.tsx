'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoMark({ size = 'md', className }: LogoMarkProps) {
  const sizeMap = {
    sm: 24,
    md: 28,
    lg: 36,
  };
  
  const px = sizeMap[size];
  
  return (
    <Image
      src="/logo.png"
      alt="Glorpi"
      width={px}
      height={px}
      className={cn('object-contain', className)}
      priority
    />
  );
}
