'use client';

import { ChevronDown, Zap, Brain, DollarSign, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modelRegistry, getModelsByProvider } from '@/lib/models-registry';
import type { ProviderId, ModelConfig } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface ModelSelectorProps {
  provider: ProviderId;
  model: string;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  className?: string;
}

const providerInfo: Record<ProviderId, { name: string; color: string }> = {
  anthropic: { name: 'Anthropic', color: 'bg-[#D4A574]' },
  openai: { name: 'OpenAI', color: 'bg-[#10A37F]' },
  gemini: { name: 'Google', color: 'bg-[#4285F4]' },
  deepseek: { name: 'DeepSeek', color: 'bg-[#0066FF]' },
  openai_compatible: { name: 'Custom', color: 'bg-ink-slate' },
};

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
  className,
}: ModelSelectorProps) {
  const models = getModelsByProvider(provider);
  const selectedModel = modelRegistry[model];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Provider selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-graphite uppercase tracking-wide">
          Provider
        </label>
        <Select value={provider} onValueChange={(v) => onProviderChange(v as ProviderId)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(providerInfo) as ProviderId[]).map((id) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', providerInfo[id].color)} />
                  {providerInfo[id].name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-graphite uppercase tracking-wide">
          Model
        </label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{m.displayName}</span>
                  {m.isDefault && (
                    <span className="ml-2 text-2xs px-1.5 py-0.5 rounded bg-glorpi-mint/10 text-glorpi-mint">
                      default
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model info card */}
      {selectedModel && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-ink-graphite">
              <Gauge className="w-3.5 h-3.5 text-glorpi-mint" />
              <span>Context</span>
            </div>
            <span className="font-mono text-white text-right">
              {formatNumber(selectedModel.contextWindow)}
            </span>

            <div className="flex items-center gap-1.5 text-ink-graphite">
              <DollarSign className="w-3.5 h-3.5 text-accent-orange" />
              <span>Input</span>
            </div>
            <span className="font-mono text-white text-right">
              ${selectedModel.inputPricePerMillion}/1M
            </span>

            <div className="flex items-center gap-1.5 text-ink-graphite">
              <DollarSign className="w-3.5 h-3.5 text-accent-orange" />
              <span>Output</span>
            </div>
            <span className="font-mono text-white text-right">
              ${selectedModel.outputPricePerMillion}/1M
            </span>
          </div>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10">
            {selectedModel.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-2xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-ink-graphite"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
