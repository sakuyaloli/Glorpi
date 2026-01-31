'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  AlertCircle,
  DollarSign,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptBlock, ProviderId, ModelKnobs } from '@/lib/types';
import { getModelsByProvider, getModelConfig, calculateCost } from '@/lib/models-registry';
import { estimatePromptTokens } from '@/lib/token-estimation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (provider: ProviderId, model: string, knobs: ModelKnobs) => Promise<void>;
  blocks: PromptBlock[];
  initialProvider: ProviderId;
  initialModel: string;
  initialKnobs: ModelKnobs;
  providerStatus: Record<ProviderId, boolean>;
}

export function SendModal({
  isOpen,
  onClose,
  onSend,
  blocks,
  initialProvider,
  initialModel,
  initialKnobs,
  providerStatus,
}: SendModalProps) {
  const [provider, setProvider] = useState<ProviderId>(initialProvider);
  const [model, setModel] = useState(initialModel);
  const [knobs, setKnobs] = useState<ModelKnobs>(initialKnobs);
  const [isSending, setIsSending] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setProvider(initialProvider);
      setModel(initialModel);
      setKnobs(initialKnobs);
    }
  }, [isOpen, initialProvider, initialModel, initialKnobs]);

  const availableModels = useMemo(() => getModelsByProvider(provider), [provider]);
  const modelConfig = useMemo(() => getModelConfig(model), [model]);

  // Calculate costs
  const tokenEstimate = useMemo(
    () => estimatePromptTokens(blocks, provider),
    [blocks, provider]
  );
  const costEstimate = useMemo(
    () =>
      calculateCost(
        model,
        tokenEstimate.inputTokens,
        knobs.maxOutputTokens || 4096
      ),
    [model, tokenEstimate, knobs.maxOutputTokens]
  );

  const isConfigured = providerStatus[provider];

  const handleProviderChange = (newProvider: ProviderId) => {
    setProvider(newProvider);
    const models = getModelsByProvider(newProvider);
    if (models.length > 0) {
      setModel(models[0].id);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend(provider, model, knobs);
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const providers: { id: ProviderId; name: string }[] = [
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'gemini', name: 'Gemini' },
    { id: 'deepseek', name: 'DeepSeek' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#12151a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-glorpi-mint" />
              <h2 className="text-lg font-medium text-ink-white">Send Prompt</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Provider selection */}
            <div>
              <Label className="text-xs text-ink-muted mb-2 block">Provider</Label>
              <div className="grid grid-cols-4 gap-2">
                {providers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      provider === p.id
                        ? 'bg-glorpi-mint/10 text-glorpi-mint border border-glorpi-mint/30'
                        : 'bg-white/5 text-ink-graphite hover:bg-white/10 border border-transparent'
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model selection */}
            <div>
              <Label className="text-xs text-ink-muted mb-2 block">Model</Label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-ink-white focus:outline-none focus:border-glorpi-mint/50"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Max output tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-ink-muted">Max Output Tokens</Label>
                <span className="text-xs text-ink-graphite font-mono">
                  {(knobs.maxOutputTokens || 4096).toLocaleString()}
                </span>
              </div>
              <Slider
                value={[knobs.maxOutputTokens || 4096]}
                onValueChange={([value]) =>
                  setKnobs(prev => ({ ...prev, maxOutputTokens: value }))
                }
                min={256}
                max={modelConfig?.contextWindow ? Math.min(modelConfig.contextWindow / 2, 32000) : 8192}
                step={256}
                className="w-full"
              />
            </div>

            {/* Cost summary */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-glorpi-mint" />
                <span className="text-sm font-medium text-ink-white">Cost Estimate</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-ink-muted mb-1">Input</div>
                  <div className="text-sm font-mono text-ink-white">
                    {tokenEstimate.inputTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-ink-muted">
                    ${costEstimate.inputCost.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">Output (est)</div>
                  <div className="text-sm font-mono text-ink-white">
                    {(knobs.maxOutputTokens || 4096).toLocaleString()}
                  </div>
                  <div className="text-xs text-ink-muted">
                    ${costEstimate.outputCost.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">Total</div>
                  <div className="text-sm font-mono text-glorpi-mint font-medium">
                    ${costEstimate.totalCost.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Not configured warning */}
            {!isConfigured && (
              <div
                className="rounded-lg p-3 flex items-start gap-3"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <AlertCircle className="w-4 h-4 text-validation-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-validation-warning font-medium">API key not configured</p>
                  <p className="text-ink-muted text-xs mt-0.5">
                    Go to{' '}
                    <Link href="/settings" className="text-glorpi-mint hover:underline">
                      Settings
                    </Link>{' '}
                    to add your {provider} API key.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-4 flex items-center justify-end gap-3"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!isConfigured || isSending}
              className="min-w-[100px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
