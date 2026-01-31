'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTokenCount } from '@/lib/token-estimation';

interface ContextGaugeProps {
  inputTokens: number;
  outputTokens: number;
  contextWindow: number;
  className?: string;
}

export function ContextGauge({
  inputTokens,
  outputTokens,
  contextWindow,
  className,
}: ContextGaugeProps) {
  const totalTokens = inputTokens + outputTokens;
  const usagePercent = (totalTokens / contextWindow) * 100;
  const inputPercent = (inputTokens / contextWindow) * 100;
  const outputPercent = (outputTokens / contextWindow) * 100;

  // Status color based on usage
  const getStatusColor = () => {
    if (usagePercent > 90) return 'text-validation-error';
    if (usagePercent > 75) return 'text-validation-warning';
    if (usagePercent > 50) return 'text-accent-orange';
    return 'text-glorpi-mint';
  };

  // Generate arc path
  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Semi-circle arc (180 degrees)
  const arcLength = circumference / 2;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-36 h-20">
        <svg
          viewBox="0 0 140 80"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Background arc */}
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/10"
          />

          {/* Blueprint tick marks */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const angle = Math.PI - (percent / 100) * Math.PI;
            const x1 = 70 + Math.cos(angle) * (normalizedRadius - 4);
            const y1 = 70 + Math.sin(angle) * (normalizedRadius - 4);
            const x2 = 70 + Math.cos(angle) * (normalizedRadius + 4);
            const y2 = 70 + Math.sin(angle) * (normalizedRadius + 4);
            return (
              <line
                key={percent}
                x1={x1}
                y1={-y1 + 140}
                x2={x2}
                y2={-y2 + 140}
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-white/20"
              />
            );
          })}

          {/* Input tokens arc (mint) */}
          <motion.path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-glorpi-mint"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: arcLength - (inputPercent / 100) * arcLength }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Output tokens arc (orange) - starts where input ends */}
          <motion.path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-accent-orange"
            strokeDasharray={`${(outputPercent / 100) * arcLength} ${arcLength}`}
            strokeDashoffset={-((inputPercent / 100) * arcLength)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={cn('text-2xl font-display font-bold', getStatusColor())}>
            {Math.round(usagePercent)}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-glorpi-mint" />
          <span className="text-ink-graphite">
            Input: <span className="font-mono text-white">{formatTokenCount(inputTokens)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
          <span className="text-ink-graphite">
            Output: <span className="font-mono text-white">{formatTokenCount(outputTokens)}</span>
          </span>
        </div>
      </div>

      <div className="text-2xs text-ink-muted mt-1 font-mono">
        Context: {formatTokenCount(contextWindow)}
      </div>
    </div>
  );
}
