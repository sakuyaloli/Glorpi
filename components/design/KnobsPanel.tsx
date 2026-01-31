'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelKnobs, ModelConfig } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { GlassPanel } from './GlassPanel';

interface KnobsPanelProps {
  knobs: ModelKnobs;
  model: ModelConfig | undefined;
  onUpdate: (updates: Partial<ModelKnobs>) => void;
  className?: string;
}

const knobDescriptions: Record<string, string> = {
  temperature:
    'Controls randomness. Lower values make output more focused and deterministic; higher values make it more creative.',
  topP: 'Nucleus sampling. Only consider tokens with cumulative probability up to this value.',
  maxOutputTokens: 'Maximum number of tokens to generate in the response.',
  reasoningEffort:
    'For reasoning models, controls how much computational effort is spent on reasoning.',
  responseFormat: 'Specify the format of the model response.',
  toolChoice: 'Control how the model uses available tools.',
};

export function KnobsPanel({ knobs, model, onUpdate, className }: KnobsPanelProps) {
  const supportedKnobs = model?.supportedKnobs || [];

  return (
    <GlassPanel variant="placard" padding="md" className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-white">Model Parameters</h3>

      <div className="space-y-5">
        {/* Temperature */}
        {supportedKnobs.includes('temperature') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                      Temperature
                      <Info className="w-3 h-3 text-ink-muted" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {knobDescriptions.temperature}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-mono text-white">
                {knobs.temperature?.toFixed(2) ?? '0.70'}
              </span>
            </div>
            <Slider
              value={[knobs.temperature ?? 0.7]}
              onValueChange={([v]) => onUpdate({ temperature: v })}
              min={0}
              max={2}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-2xs text-ink-muted">
              <span>Focused</span>
              <span>Creative</span>
            </div>
          </div>
        )}

        {/* Top P */}
        {supportedKnobs.includes('topP') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                      Top P
                      <Info className="w-3 h-3 text-ink-muted" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{knobDescriptions.topP}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-mono text-white">
                {knobs.topP?.toFixed(2) ?? '1.00'}
              </span>
            </div>
            <Slider
              value={[knobs.topP ?? 1]}
              onValueChange={([v]) => onUpdate({ topP: v })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        )}

        {/* Max Output Tokens */}
        {supportedKnobs.includes('maxOutputTokens') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                      Max Output Tokens
                      <Info className="w-3 h-3 text-ink-muted" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {knobDescriptions.maxOutputTokens}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-mono text-white">
                {knobs.maxOutputTokens ?? 4096}
              </span>
            </div>
            <Slider
              value={[knobs.maxOutputTokens ?? 4096]}
              onValueChange={([v]) => onUpdate({ maxOutputTokens: v })}
              min={256}
              max={32000}
              step={256}
              className="w-full"
            />
            <div className="flex justify-between text-2xs text-ink-muted">
              <span>256</span>
              <span>32K</span>
            </div>
          </div>
        )}

        {/* Reasoning Effort */}
        {supportedKnobs.includes('reasoningEffort') && (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                    Reasoning Effort
                    <Info className="w-3 h-3 text-ink-muted" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {knobDescriptions.reasoningEffort}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={knobs.reasoningEffort ?? 'medium'}
              onValueChange={(v) =>
                onUpdate({ reasoningEffort: v as 'low' | 'medium' | 'high' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Response Format */}
        {supportedKnobs.includes('responseFormat') && (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                    Response Format
                    <Info className="w-3 h-3 text-ink-muted" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {knobDescriptions.responseFormat}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={knobs.responseFormat ?? 'text'}
              onValueChange={(v) =>
                onUpdate({ responseFormat: v as 'text' | 'json' | 'markdown' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tool Choice */}
        {supportedKnobs.includes('toolChoice') && (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1.5 cursor-help text-ink-graphite">
                    Tool Usage
                    <Info className="w-3 h-3 text-ink-muted" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {knobDescriptions.toolChoice}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={knobs.toolChoice ?? 'auto'}
              onValueChange={(v) =>
                onUpdate({ toolChoice: v as 'auto' | 'required' | 'none' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="required">Required</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {supportedKnobs.length === 0 && (
        <p className="text-sm text-ink-muted text-center py-4">
          No configurable parameters for this model.
        </p>
      )}
    </GlassPanel>
  );
}
