'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationIssue, ValidationSeverity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from './GlassPanel';

interface ValidationListProps {
  issues: ValidationIssue[];
  onApplyFix?: (issueId: string) => void;
  onNavigateToBlock?: (blockId: string) => void;
  className?: string;
}

const severityConfig: Record<
  ValidationSeverity,
  { icon: React.ElementType; color: string; bg: string }
> = {
  error: {
    icon: AlertCircle,
    color: 'text-validation-error',
    bg: 'bg-validation-error/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-validation-warning',
    bg: 'bg-validation-warning/10',
  },
  info: {
    icon: Info,
    color: 'text-validation-info',
    bg: 'bg-validation-info/10',
  },
};

export function ValidationList({
  issues,
  onApplyFix,
  onNavigateToBlock,
  className,
}: ValidationListProps) {
  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');

  if (issues.length === 0) {
    return (
      <GlassPanel variant="placard" padding="md" className={cn('text-center', className)}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2 py-4"
        >
          <div className="p-3 rounded-full bg-validation-success/10">
            <CheckCircle2 className="w-6 h-6 text-validation-success" />
          </div>
          <div>
            <p className="font-medium text-white">All checks passed</p>
            <p className="text-sm text-ink-graphite">Your prompt is ready to send</p>
          </div>
        </motion.div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="placard" padding="none" className={className}>
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 border-b flex items-center justify-between',
          hasErrors
            ? 'bg-validation-error/5 border-validation-error/20'
            : hasWarnings
            ? 'bg-validation-warning/5 border-validation-warning/20'
            : 'bg-validation-info/5 border-validation-info/20'
        )}
      >
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <AlertCircle className="w-4 h-4 text-validation-error" />
          ) : hasWarnings ? (
            <AlertTriangle className="w-4 h-4 text-validation-warning" />
          ) : (
            <Info className="w-4 h-4 text-validation-info" />
          )}
          <span className="text-sm font-medium text-white">
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          {hasErrors && (
            <span className="px-2 py-0.5 rounded-full bg-validation-error/10 text-validation-error">
              {issues.filter((i) => i.severity === 'error').length} errors
            </span>
          )}
          {hasWarnings && (
            <span className="px-2 py-0.5 rounded-full bg-validation-warning/10 text-validation-warning">
              {issues.filter((i) => i.severity === 'warning').length} warnings
            </span>
          )}
        </div>
      </div>

      {/* Issues list */}
      <div className="divide-y divide-white/10">
        <AnimatePresence>
          {issues.map((issue, index) => {
            const config = severityConfig[issue.severity];
            const Icon = config.icon;

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex gap-3">
                  <div className={cn('p-1.5 rounded-md h-fit', config.bg)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">{issue.title}</p>
                    <p className="text-sm text-ink-graphite mt-0.5">{issue.description}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {issue.autoFixable && onApplyFix && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-glorpi-mint hover:text-glorpi-mint-dark"
                          onClick={() => onApplyFix(issue.id)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Apply fix
                        </Button>
                      )}
                      {issue.blockId && onNavigateToBlock && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-ink-graphite hover:text-white"
                          onClick={() => onNavigateToBlock(issue.blockId!)}
                        >
                          Go to block
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>

                    {/* Suggestion */}
                    {issue.suggestion && (
                      <p className="text-xs text-ink-muted mt-2 italic">
                        Tip: {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
