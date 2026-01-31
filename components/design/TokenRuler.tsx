'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTokenCount } from '@/lib/token-estimation';

interface TokenRulerProps {
  tokens: number;
  maxTokens: number;
  className?: string;
  showLabels?: boolean;
  variant?: 'horizontal' | 'vertical';
  label?: string;
}

export function TokenRuler({
  tokens,
  maxTokens,
  className,
  showLabels = true,
  variant = 'horizontal',
  label = 'Tokens',
}: TokenRulerProps) {
  const percentage = Math.min(100, (tokens / maxTokens) * 100);

  // Color based on usage
  const getColor = () => {
    if (percentage > 90) return 'bg-validation-error';
    if (percentage > 75) return 'bg-validation-warning';
    if (percentage > 50) return 'bg-accent-orange';
    return 'bg-glorpi-mint';
  };

  // Generate tick marks
  const ticks = [0, 25, 50, 75, 100];

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {showLabels && (
          <span className="text-2xs font-mono text-ink-muted uppercase tracking-wide">{label}</span>
        )}
        <div className="relative h-32 w-3 rounded-full bg-white/10 border border-white/10 overflow-hidden">
          <motion.div
            className={cn('absolute bottom-0 left-0 right-0 rounded-full', getColor())}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Tick marks */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0 h-px bg-white/20"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>
        {showLabels && (
          <div className="text-center">
            <span className="text-sm font-mono font-medium text-white">
              {formatTokenCount(tokens)}
            </span>
            <span className="text-2xs text-ink-muted block">
              / {formatTokenCount(maxTokens)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {showLabels && (
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-ink-graphite">{label}</span>
          <span className="text-xs font-mono text-white">
            {formatTokenCount(tokens)}{' '}
            <span className="text-ink-muted">/ {formatTokenCount(maxTokens)}</span>
          </span>
        </div>
      )}
      <div className="relative h-3 rounded-full bg-white/10 border border-white/10 overflow-hidden">
        {/* Blueprint ruler marks */}
        <div className="absolute inset-0 flex justify-between px-1">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="w-px h-full bg-white/20"
              style={{ marginLeft: tick === 0 ? 0 : 'auto' }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          className={cn('absolute top-0 left-0 h-full rounded-full', getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Ruler marks below */}
      <div className="relative h-2 flex justify-between text-2xs font-mono text-ink-muted">
        {ticks.map((tick) => (
          <span key={tick}>{formatTokenCount((maxTokens * tick) / 100)}</span>
        ))}
      </div>
    </div>
  );
}
