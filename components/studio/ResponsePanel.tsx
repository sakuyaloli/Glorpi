'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Clock,
  MessageSquare,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SendResponse } from '@/lib/types';
import { GlassPanel } from '@/components/design/GlassPanel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResponsePanelProps {
  response: SendResponse | null;
  onClose: () => void;
  onRetry: () => void;
  className?: string;
}

export function ResponsePanel({ response, onClose, onRetry, className }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  const handleCopy = async () => {
    if (response.content) {
      await navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn('fixed inset-x-0 bottom-0 z-50', className)}
    >
      <div className="mx-auto max-w-4xl p-4">
        <GlassPanel
          variant="frosted"
          padding="none"
          className="border-2 border-glorpi-mint/30 shadow-glass-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  response.success ? 'bg-validation-success' : 'bg-validation-error'
                )}
              />
              <h3 className="font-medium text-white">
                {response.success ? 'Response Received' : 'Error'}
              </h3>

              {/* Stats */}
              {response.success && response.usage && (
                <div className="flex items-center gap-4 text-xs text-ink-graphite">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{response.usage.totalTokens.toLocaleString()} tokens</span>
                  </div>
                  {response.latencyMs && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{(response.latencyMs / 1000).toFixed(2)}s</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {response.success && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 text-validation-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onRetry}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-4">
              {response.success ? (
                <div className="prose prose-sm max-w-none prose-invert">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-ink-graphite bg-canvas-darker p-4 rounded-lg">
                    {response.content}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-validation-error/10 border border-validation-error/20">
                  <p className="text-sm text-validation-error">{response.error}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Token breakdown */}
          {response.success && response.usage && (
            <div className="px-4 py-3 border-t border-white/10 bg-canvas-darker">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-ink-muted">Input:</span>
                  <span className="ml-1 font-mono text-white">
                    {response.usage.inputTokens.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted">Output:</span>
                  <span className="ml-1 font-mono text-white">
                    {response.usage.outputTokens.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted">Total:</span>
                  <span className="ml-1 font-mono text-white">
                    {response.usage.totalTokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </motion.div>
  );
}
