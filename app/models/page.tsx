'use client';

import { motion } from 'framer-motion';
import {
  Database,
  Gauge,
  DollarSign,
  Cpu,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModelsByProvider } from '@/lib/models-registry';
import type { ProviderId, ModelConfig } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Navigation } from '@/components/layout/Navigation';
import { BlueprintGrid } from '@/components/design/BlueprintGrid';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const providers: { id: ProviderId; name: string; color: string }[] = [
  { id: 'anthropic', name: 'Anthropic (Claude)', color: 'bg-[#D4A574]' },
  { id: 'openai', name: 'OpenAI (GPT)', color: 'bg-[#10A37F]' },
  { id: 'gemini', name: 'Google (Gemini)', color: 'bg-[#4285F4]' },
  { id: 'deepseek', name: 'DeepSeek', color: 'bg-[#0066FF]' },
];

function ModelCard({ model }: { model: ModelConfig }) {
  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-ink-white">{model.displayName}</h3>
          <p className="text-xs font-mono text-ink-muted">{model.id}</p>
        </div>
        {model.isDefault && (
          <span 
            className="px-2 py-0.5 text-2xs rounded"
            style={{ backgroundColor: 'rgba(152, 215, 161, 0.1)', color: '#98d7a1' }}
          >
            default
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Context Window */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-ink-slate">
            <Gauge className="w-4 h-4" />
            <span>Context Window</span>
          </div>
          <span className="font-mono text-ink-white">{formatNumber(model.contextWindow)}</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-ink-slate">
            <DollarSign className="w-4 h-4" />
            <span>Input / 1M</span>
          </div>
          <span className="font-mono text-ink-white">${model.inputPricePerMillion}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-ink-slate">
            <DollarSign className="w-4 h-4" />
            <span>Output / 1M</span>
          </div>
          <span className="font-mono text-ink-white">${model.outputPricePerMillion}</span>
        </div>

        {/* Capabilities */}
        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-ink-muted text-xs mb-2">
            <Cpu className="w-3 h-3" />
            <span>Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {model.capabilities.map((cap) => (
              <span
                key={cap}
                className="px-2 py-0.5 text-2xs rounded bg-white/[0.04] text-ink-graphite"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Supported Knobs */}
        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-ink-muted text-xs mb-2">
            <Settings className="w-3 h-3" />
            <span>Parameters</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {model.supportedKnobs.map((knob) => (
              <span
                key={knob}
                className="px-2 py-0.5 text-2xs rounded"
                style={{ backgroundColor: 'rgba(152, 215, 161, 0.1)', color: '#98d7a1' }}
              >
                {knob}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  return (
    <BlueprintGrid className="min-h-screen">
      <Navigation />

      <main className="pt-20 pb-16 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink-white mb-2">Model Registry</h1>
          <p className="text-sm text-ink-graphite">
            Available models with context windows, pricing, and capabilities.
          </p>
        </div>

        <Accordion type="multiple" defaultValue={['anthropic']} className="space-y-2">
          {providers.map((provider) => {
            const models = getModelsByProvider(provider.id);
            return (
              <AccordionItem
                key={provider.id}
                value={provider.id}
                className="surface overflow-hidden border-0"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2.5 h-2.5 rounded-full', provider.color)} />
                    <span className="text-sm font-medium text-ink-white">
                      {provider.name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      ({models.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {models.map((model) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <ModelCard model={model} />
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Info note */}
        <div 
          className="mt-6 p-4 rounded-xl flex items-start gap-3"
          style={{ 
            backgroundColor: 'rgba(152, 215, 161, 0.05)',
            border: '1px solid rgba(152, 215, 161, 0.1)'
          }}
        >
          <Database className="w-4 h-4 text-glorpi-mint shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-ink-white mb-1">Editable Registry</p>
            <p className="text-xs text-ink-graphite">
              Edit models in <code className="px-1 py-0.5 rounded text-glorpi-mint bg-glorpi-mint/10 text-xs">lib/models-registry.ts</code>
            </p>
          </div>
        </div>
      </main>
    </BlueprintGrid>
  );
}
