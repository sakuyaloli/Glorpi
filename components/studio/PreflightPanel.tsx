'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Eye,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptBlock, ModelKnobs, ProviderId, StudioMode } from '@/lib/types';
import { validatePrompt, getSuggestedFix } from '@/lib/validation';
import { estimatePromptTokens, blocksToMessages } from '@/lib/token-estimation';
import { getModelById, calculateCost, getContextWindowUsage } from '@/lib/models-registry';
import { GlassPanel } from '@/components/design/GlassPanel';
import { ValidationList } from '@/components/design/ValidationList';
import { ContextGauge } from '@/components/design/ContextGauge';
import { CostDisplay } from '@/components/design/CostDisplay';
import { ModelSelector } from '@/components/design/ModelSelector';
import { KnobsPanel } from '@/components/design/KnobsPanel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { v4 as uuid } from 'uuid';

interface PreflightPanelProps {
  blocks: PromptBlock[];
  provider: ProviderId;
  model: string;
  knobs: ModelKnobs;
  mode: StudioMode;
  isProviderConfigured: boolean;
  onModeChange: (mode: StudioMode) => void;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onKnobsChange: (knobs: ModelKnobs) => void;
  onBlocksChange: (blocks: PromptBlock[]) => void;
  onSend: () => Promise<void>;
  isSending: boolean;
  className?: string;
}

export function PreflightPanel({
  blocks,
  provider,
  model,
  knobs,
  mode,
  isProviderConfigured,
  onModeChange,
  onProviderChange,
  onModelChange,
  onKnobsChange,
  onBlocksChange,
  onSend,
  isSending,
  className,
}: PreflightPanelProps) {
  // Output token estimate - absolute value, not percentage
  const [outputTokenEstimate, setOutputTokenEstimate] = useState(512);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const modelConfig = useMemo(() => getModelById(model), [model]);
  
  // Max output tokens based on model (or default to 8192)
  const maxOutputTokens = modelConfig?.contextWindow 
    ? Math.min(Math.floor(modelConfig.contextWindow / 4), 8192)
    : 8192;

  // Calculate token estimates
  const tokenEstimate = useMemo(
    () => estimatePromptTokens(blocks, provider),
    [blocks, provider]
  );

  // Calculate costs using the absolute output token estimate
  const costEstimate = useMemo(
    () => calculateCost(model, tokenEstimate.inputTokens, outputTokenEstimate),
    [model, tokenEstimate.inputTokens, outputTokenEstimate]
  );

  // Context window usage
  const contextUsage = useMemo(
    () =>
      getContextWindowUsage(model, tokenEstimate.inputTokens, outputTokenEstimate),
    [model, tokenEstimate.inputTokens, outputTokenEstimate]
  );

  // Validation
  const validationIssues = useMemo(() => validatePrompt(blocks), [blocks]);
  const hasErrors = validationIssues.some((i) => i.severity === 'error');

  // Generate payload preview
  const messages = useMemo(() => blocksToMessages(blocks), [blocks]);
  const payloadPreview = useMemo(
    () =>
      JSON.stringify(
        {
          model,
          messages,
          ...(knobs.temperature !== undefined && { temperature: knobs.temperature }),
          ...(knobs.maxOutputTokens && { max_tokens: knobs.maxOutputTokens }),
        },
        null,
        2
      ),
    [model, messages, knobs]
  );

  const handleApplyFix = (issueId: string) => {
    const issue = validationIssues.find((i) => i.id === issueId);
    if (!issue) return;

    const fix = getSuggestedFix(issue, blocks);
    if (!fix) return;

    if (issue.blockId) {
      // Update existing block
      onBlocksChange(
        blocks.map((b) => (b.id === issue.blockId ? { ...b, ...fix } : b))
      );
    } else {
      // Add new block
      const newBlock: PromptBlock = {
        id: uuid(),
        ...(fix as Omit<PromptBlock, 'id'>),
      };
      onBlocksChange([newBlock, ...blocks]);
    }
  };

  const handleCopyPayload = async () => {
    await navigator.clipboard.writeText(payloadPreview);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSendClick = () => {
    if (hasErrors) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false);
    await onSend();
  };

  return (
    <TooltipProvider>
    <div className={cn('flex flex-col h-full', className)}>
      {/* Tabs - no top review button anymore */}
      <Tabs defaultValue="preflight" className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 px-4 py-2 border-b border-white/10 bg-canvas-card">
          <TabsList className="w-full">
            <TabsTrigger value="preflight" className="flex-1">
              Preflight
            </TabsTrigger>
            <TabsTrigger value="model" className="flex-1">
              Model
            </TabsTrigger>
            <TabsTrigger value="payload" className="flex-1">
              Payload
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {/* Preflight Tab */}
          <TabsContent value="preflight" className="p-4 space-y-4 mt-0">
            {/* Token & Cost Overview */}
            <div className="grid grid-cols-2 gap-4">
              <GlassPanel variant="placard" padding="md">
                <ContextGauge
                  inputTokens={tokenEstimate.inputTokens}
                  outputTokens={outputTokenEstimate}
                  contextWindow={modelConfig?.contextWindow || 128000}
                />
              </GlassPanel>
              <CostDisplay
                inputCost={costEstimate.inputCost}
                outputCost={costEstimate.outputCost}
                totalCost={costEstimate.totalCost}
              />
            </div>

            {/* Estimated Output Tokens - absolute value */}
            <GlassPanel variant="placard" padding="md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm text-white">Estimated Output Tokens</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-ink-muted hover:text-ink-white">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <p className="text-xs">
                          Used for cost estimation only. The actual output length depends on the model&apos;s response.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-glorpi-mint">
                    {outputTokenEstimate.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[outputTokenEstimate]}
                  onValueChange={([v]) => setOutputTokenEstimate(v)}
                  min={32}
                  max={maxOutputTokens}
                  step={32}
                />
                {/* Preset buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutputTokenEstimate(128)}
                    className={cn(
                      'flex-1 py-1.5 rounded text-xs transition-colors',
                      outputTokenEstimate === 128
                        ? 'bg-glorpi-mint/20 text-glorpi-mint'
                        : 'bg-white/5 text-ink-muted hover:text-ink-white'
                    )}
                  >
                    Concise
                  </button>
                  <button
                    onClick={() => setOutputTokenEstimate(512)}
                    className={cn(
                      'flex-1 py-1.5 rounded text-xs transition-colors',
                      outputTokenEstimate === 512
                        ? 'bg-glorpi-mint/20 text-glorpi-mint'
                        : 'bg-white/5 text-ink-muted hover:text-ink-white'
                    )}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setOutputTokenEstimate(1536)}
                    className={cn(
                      'flex-1 py-1.5 rounded text-xs transition-colors',
                      outputTokenEstimate === 1536
                        ? 'bg-glorpi-mint/20 text-glorpi-mint'
                        : 'bg-white/5 text-ink-muted hover:text-ink-white'
                    )}
                  >
                    Verbose
                  </button>
                </div>
              </div>
            </GlassPanel>

            {/* Validation */}
            <ValidationList
              issues={validationIssues}
              onApplyFix={handleApplyFix}
            />

            {/* Confidence indicator */}
            <GlassPanel variant="placard" padding="sm">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    tokenEstimate.confidence === 'high' && 'bg-validation-success',
                    tokenEstimate.confidence === 'medium' && 'bg-validation-warning',
                    tokenEstimate.confidence === 'low' && 'bg-validation-error'
                  )}
                />
                <span className="text-ink-graphite">
                  Estimation confidence:{' '}
                  <span className="font-medium text-white capitalize">
                    {tokenEstimate.confidence}
                  </span>
                </span>
              </div>
            </GlassPanel>
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model" className="p-4 space-y-4 mt-0">
            <ModelSelector
              provider={provider}
              model={model}
              onProviderChange={onProviderChange}
              onModelChange={onModelChange}
            />
            <KnobsPanel
              knobs={knobs}
              model={modelConfig}
              onUpdate={(updates) => onKnobsChange({ ...knobs, ...updates })}
            />
          </TabsContent>

          {/* Payload Tab */}
          <TabsContent value="payload" className="p-4 space-y-4 mt-0">
            <GlassPanel variant="placard" padding="none">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-sm font-medium text-white">Request Preview</span>
                <Button variant="ghost" size="sm" onClick={handleCopyPayload}>
                  {copiedPayload ? (
                    <Check className="w-4 h-4 text-validation-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono text-ink-graphite overflow-auto max-h-[400px] bg-canvas-darker">
                {payloadPreview}
              </pre>
            </GlassPanel>
          </TabsContent>
        </ScrollArea>

        {/* Main Action Button - Review first, then Send */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-canvas-card space-y-2">
          {mode === 'build' ? (
            // BUILD MODE: Show Review button
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={() => onModeChange('review')}
                disabled={blocks.length === 0}
              >
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
              <p className="text-2xs text-ink-muted text-center">
                Review prompt before sending
              </p>
            </>
          ) : (
            // REVIEW MODE: Show Send button (or Configure Provider)
            <>
              {isProviderConfigured ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendClick}
                  disabled={hasErrors || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : hasErrors ? (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Fix Errors First
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Quick Send
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/settings'}
                >
                  Configure Provider
                </Button>
              )}
              
              {/* Back to Builder button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onModeChange('build')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Button>
              
              <p className="text-2xs text-ink-muted text-center">
                {isProviderConfigured 
                  ? `Ready to send to ${modelConfig?.displayName || model}`
                  : 'Add API key in Settings to send'
                }
              </p>
            </>
          )}
        </div>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>
              Review the details before sending your prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-ink-graphite">Model:</span>
                <p className="font-medium text-white">
                  {modelConfig?.displayName}
                </p>
              </div>
              <div>
                <span className="text-ink-graphite">Provider:</span>
                <p className="font-medium text-white capitalize">{provider}</p>
              </div>
              <div>
                <span className="text-ink-graphite">Input Tokens:</span>
                <p className="font-mono text-white">
                  ~{tokenEstimate.inputTokens.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-ink-graphite">Output (est.):</span>
                <p className="font-mono text-white">
                  {outputTokenEstimate.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-ink-graphite">Est. Cost:</span>
                <p className="font-mono text-glorpi-mint text-lg">
                  ${costEstimate.totalCost.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Warnings */}
            {validationIssues.filter((i) => i.severity === 'warning').length > 0 && (
              <div className="p-3 rounded-lg bg-validation-warning/10 border border-validation-warning/20">
                <div className="flex items-center gap-2 text-sm text-validation-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {validationIssues.filter((i) => i.severity === 'warning').length}{' '}
                    warnings detected but proceeding is possible
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSend}>
              <Send className="w-4 h-4 mr-2" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
