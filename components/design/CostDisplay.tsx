'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { GlassPanel } from './GlassPanel';

interface CostDisplayProps {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  className?: string;
  previousTotal?: number;
}

export function CostDisplay({
  inputCost,
  outputCost,
  totalCost,
  className,
  previousTotal,
}: CostDisplayProps) {
  const trend = previousTotal !== undefined ? totalCost - previousTotal : 0;
  const trendPercent = previousTotal ? ((trend / previousTotal) * 100).toFixed(1) : '0';

  return (
    <GlassPanel variant="placard" padding="md" className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-glorpi-mint" />
          Estimated Cost
        </h3>
        {previousTotal !== undefined && trend !== 0 && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-mono',
              trend > 0 ? 'text-validation-error' : 'text-validation-success'
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendPercent}%
          </div>
        )}
      </div>

      {/* Cost breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-ink-graphite">Input</span>
          <span className="font-mono text-white">{formatCurrency(inputCost)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-ink-graphite">Output (est.)</span>
          <span className="font-mono text-white">{formatCurrency(outputCost)}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-ink-graphite font-medium">Total</span>
          <motion.span
            key={totalCost}
            initial={{ scale: 1.1, color: '#7ECFB3' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-lg font-display font-bold"
          >
            {formatCurrency(totalCost)}
          </motion.span>
        </div>
      </div>

      {/* Visual cost indicator */}
      <div className="pt-2">
        <div className="flex gap-1 h-2">
          {[...Array(10)].map((_, i) => {
            const threshold = (i + 1) * 0.01; // $0.01 increments
            const filled = totalCost >= threshold;
            return (
              <motion.div
                key={i}
                className={cn(
                  'flex-1 rounded-sm transition-colors duration-200',
                  filled
                    ? i < 3
                      ? 'bg-glorpi-mint'
                      : i < 6
                      ? 'bg-accent-orange'
                      : 'bg-validation-error'
                    : 'bg-white/10'
                )}
                initial={filled ? { scale: 0 } : {}}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-2xs text-ink-muted mt-1 font-mono">
          <span>$0</span>
          <span>$0.10</span>
        </div>
      </div>
    </GlassPanel>
  );
}
