'use client';

import { cn } from '@/lib/utils';

interface BlueprintGridProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'none';
}

export function BlueprintGrid({
  className,
  children,
  variant = 'default',
}: BlueprintGridProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Base layer - deep dark background */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: '#0c0e11' }}
      />

      {/* Subtle vignette + gradient - only for default/subtle */}
      {variant !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 10%, rgba(152, 215, 161, 0.04), transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 90%, rgba(152, 215, 161, 0.02), transparent 50%),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 0%, transparent 30%)
            `,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
