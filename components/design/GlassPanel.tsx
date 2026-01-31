'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'frosted' | 'clear' | 'placard' | 'inset';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassPanel({
  className,
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
}: GlassPanelProps) {
  const variantStyles = {
    default: 'bg-[#12151a] border border-white/[0.06] shadow-soft',
    frosted: 'bg-[#12151a]/90 backdrop-blur-md border border-white/[0.08] shadow-soft-md',
    clear: 'bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] shadow-soft',
    placard: 'bg-[#12151a] border border-white/[0.06] shadow-soft',
    inset: 'bg-black/20 border border-white/[0.04] shadow-inner-soft',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.15 },
      }
    : {};

  return (
    <Component
      className={cn(
        'relative rounded-xl transition-all duration-150',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'hover:border-white/[0.1] hover:shadow-soft-md',
        className
      )}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}
