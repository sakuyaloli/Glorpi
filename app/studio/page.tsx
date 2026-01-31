'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  PromptBlock, 
  ProviderId, 
  ModelKnobs, 
  SendResponse, 
  CompanionSuggestion,
  StudioMode,
  PromptPlan,
  PlanBlockType,
  BlockType,
} from '@/lib/types';
import { blocksToMessages } from '@/lib/token-estimation';
import { validatePrompt } from '@/lib/validation';
import { Navigation } from '@/components/layout/Navigation';
import { BlueprintGrid } from '@/components/design/BlueprintGrid';
import { PromptBuilder } from '@/components/studio/PromptBuilder';
import { PromptReview } from '@/components/studio/PromptReview';
import { PreflightPanel } from '@/components/studio/PreflightPanel';
import { ResponsePanel } from '@/components/studio/ResponsePanel';
import { SendModal } from '@/components/studio/SendModal';
import { CompanionChat } from '@/components/companion/CompanionChat';
import { GlorpiLive2DHost } from '@/components/live2d/GlorpiLive2DHost';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuid } from 'uuid';

// Block type mapping from plan types to full block types
const planToBlockType: Record<PlanBlockType, BlockType> = {
  system: 'system',
  role: 'role',
  goal: 'goal',
  constraints: 'constraints',
  output_format: 'output_format',
  examples: 'examples',
  tools: 'tools',
  environment: 'environment',
  evaluation: 'evaluation',
  notes: 'custom',
};

// Canonical block order for merging
const blockTypeOrder: BlockType[] = [
  'system',
  'role',
  'goal',
  'constraints',
  'output_format',
  'examples',
  'tools',
  'environment',
  'evaluation',
  'custom',
];

// Initial blocks for demo
const initialBlocks: PromptBlock[] = [
  {
    id: uuid(),
    type: 'system',
    title: 'System Instructions',
    content: 'You are a helpful AI assistant focused on providing accurate, well-structured responses.',
    enabled: true,
    locked: false,
    collapsed: false,
  },
  {
    id: uuid(),
    type: 'goal',
    title: 'Goal',
    content: 'Help users accomplish their tasks efficiently while maintaining clarity and accuracy.',
    enabled: true,
    locked: false,
    collapsed: false,
  },
];

export default function StudioPage() {
  // Core state
  const [blocks, setBlocks] = useState<PromptBlock[]>(initialBlocks);
  const [provider, setProvider] = useState<ProviderId>('anthropic');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [knobs, setKnobs] = useState<ModelKnobs>({
    temperature: 0.7,
    maxOutputTokens: 4096,
  });
  
  // UI state
  const [mode, setMode] = useState<StudioMode>('build');
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<SendResponse | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [providerStatus, setProviderStatus] = useState<Record<ProviderId, boolean>>({
    anthropic: false,
    openai: false,
    gemini: false,
    deepseek: false,
    openai_compatible: false,
  });
  
  const { toast } = useToast();

  // Fetch provider status on mount
  useEffect(() => {
    fetch('/api/providers/status')
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          const status: Record<ProviderId, boolean> = {
            anthropic: false,
            openai: false,
            gemini: false,
            deepseek: false,
            openai_compatible: false,
          };
          data.providers.forEach((p: { id: ProviderId; configured: boolean }) => {
            status[p.id] = p.configured;
          });
          setProviderStatus(status);
        }
      })
      .catch(() => {});
  }, []);

  // Validation state for expression triggers
  const validationState = useMemo(() => {
    const issues = validatePrompt(blocks);
    const hasError = issues.some(i => i.severity === 'error');
    const hasWarning = issues.some(i => i.severity === 'warning') && !hasError;
    return { hasError, hasWarning };
  }, [blocks]);

  const handleProviderChange = useCallback((newProvider: ProviderId) => {
    setProvider(newProvider);
    // Reset to default model for provider
    const defaultModels: Record<ProviderId, string> = {
      anthropic: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4o',
      gemini: 'gemini-1.5-pro',
      deepseek: 'deepseek-chat',
      openai_compatible: 'gpt-4o',
    };
    setModel(defaultModels[newProvider]);
  }, []);

  // Send via modal
  const handleSendFromModal = useCallback(async (
    sendProvider: ProviderId,
    sendModel: string,
    sendKnobs: ModelKnobs
  ) => {
    setIsSending(true);
    const startTime = Date.now();

    try {
      const messages = blocksToMessages(blocks);

      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: sendProvider,
          model: sendModel,
          messages,
          knobs: sendKnobs,
        }),
      });

      const data = await res.json();
      const latencyMs = Date.now() - startTime;

      if (data.success) {
        setResponse({ ...data, latencyMs });
        toast({
          title: 'Response received',
          description: `Completed in ${(latencyMs / 1000).toFixed(2)}s`,
        });
      } else {
        setResponse({ ...data, latencyMs });
        toast({
          title: 'Error',
          description: data.error || 'Failed to get response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send request. Check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [blocks, toast]);

  // Legacy send handler (for preflight panel)
  const handleSend = useCallback(async () => {
    await handleSendFromModal(provider, model, knobs);
  }, [handleSendFromModal, provider, model, knobs]);

  const handleApplySuggestion = useCallback((suggestion: CompanionSuggestion) => {
    if (suggestion.type === 'add_block' && suggestion.blockType && suggestion.blockContent) {
      const newBlock: PromptBlock = {
        id: uuid(),
        type: suggestion.blockType,
        title: suggestion.title.replace('Add ', ''),
        content: suggestion.blockContent,
        enabled: true,
        locked: false,
        collapsed: false,
      };
      setBlocks(prev => [...prev, newBlock]);
      toast({
        title: 'Block added',
        description: `Added "${newBlock.title}" block`,
      });
    } else if (suggestion.type === 'modify_block' && suggestion.targetBlockId) {
      setBlocks(prev => prev.map(b => 
        b.id === suggestion.targetBlockId
          ? { ...b, content: suggestion.blockContent || b.content }
          : b
      ));
      toast({
        title: 'Block updated',
        description: 'Applied suggested changes',
      });
    }
  }, [toast]);

  // Apply AI-generated plan to blocks
  const handleApplyPlan = useCallback((plan: PromptPlan) => {
    setBlocks(currentBlocks => {
      const newBlocks = [...currentBlocks];
      let addedCount = 0;
      let updatedCount = 0;

      for (const planBlock of plan.blocks) {
        const blockType = planToBlockType[planBlock.type] || 'custom';
        
        // Check if a block of this type already exists (and is not locked)
        const existingIndex = newBlocks.findIndex(
          b => b.type === blockType && !b.locked
        );

        if (existingIndex >= 0) {
          // Update existing block
          newBlocks[existingIndex] = {
            ...newBlocks[existingIndex],
            title: planBlock.heading,
            content: planBlock.content,
            enabled: planBlock.enabled !== false,
          };
          updatedCount++;
        } else {
          // Insert new block in canonical order
          const newBlock: PromptBlock = {
            id: uuid(),
            type: blockType,
            title: planBlock.heading,
            content: planBlock.content,
            enabled: planBlock.enabled !== false,
            locked: false,
            collapsed: false,
          };

          // Find the right insertion point based on canonical order
          const typeIndex = blockTypeOrder.indexOf(blockType);
          let insertIndex = newBlocks.length;

          for (let i = 0; i < newBlocks.length; i++) {
            const currentTypeIndex = blockTypeOrder.indexOf(newBlocks[i].type);
            if (currentTypeIndex > typeIndex) {
              insertIndex = i;
              break;
            }
          }

          newBlocks.splice(insertIndex, 0, newBlock);
          addedCount++;
        }
      }

      // Show toast notification
      if (addedCount > 0 || updatedCount > 0) {
        const parts = [];
        if (addedCount > 0) parts.push(`${addedCount} added`);
        if (updatedCount > 0) parts.push(`${updatedCount} updated`);
        
        toast({
          title: 'Blocks generated',
          description: parts.join(', '),
        });
      }

      return newBlocks;
    });
  }, [toast]);

  // Check if any provider is configured for send
  const hasConfiguredProvider = useMemo(() => {
    return Object.values(providerStatus).some(v => v);
  }, [providerStatus]);

  return (
    <BlueprintGrid className="min-h-screen">
      <Navigation />

      <main className="pt-14 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Companion Panel */}
          <div 
            className="w-80 shrink-0 flex flex-col border-r"
            style={{ backgroundColor: '#0a0c0f', borderColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            {/* Live2D Character */}
            <div 
              className="min-h-[240px] h-[clamp(240px,32vh,380px)] p-3 border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <GlorpiLive2DHost 
                className="w-full h-full" 
                debug
                hasError={validationState.hasError}
                hasWarning={validationState.hasWarning}
                isGenerating={isGenerating}
              />
            </div>
            
            {/* Chat */}
            <div className="flex-1 overflow-hidden">
              <CompanionChat 
                onApplySuggestion={handleApplySuggestion}
                onApplyPlan={handleApplyPlan}
                onGeneratingChange={setIsGenerating}
                currentBlocks={blocks}
                provider={provider}
                model={model}
              />
            </div>
          </div>

          {/* Center: Prompt Builder or Review */}
          <div 
            className="flex-1 min-w-0 flex flex-col"
            style={{ backgroundColor: '#0c0e11' }}
          >
            {/* Minimal toolbar - only shows Send button when in build mode and provider configured */}
            {mode === 'build' && hasConfiguredProvider && (
              <div 
                className="shrink-0 px-4 py-2 flex items-center justify-end"
                style={{ 
                  backgroundColor: '#0a0c0f',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <Button
                  size="sm"
                  onClick={() => setShowSendModal(true)}
                  className="h-8"
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Send...
                </Button>
              </div>
            )}

            {/* Content based on mode */}
            <AnimatePresence mode="wait">
              {mode === 'build' ? (
                <motion.div
                  key="builder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <PromptBuilder
                    blocks={blocks}
                    onBlocksChange={setBlocks}
                    provider={provider}
                    className="h-full"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="review"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <PromptReview
                    blocks={blocks}
                    provider={provider}
                    model={model}
                    onBack={() => setMode('build')}
                    className="h-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Preflight Panel */}
          <div 
            className="w-96 shrink-0 border-l"
            style={{ backgroundColor: '#0a0c0f', borderColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <PreflightPanel
              blocks={blocks}
              provider={provider}
              model={model}
              knobs={knobs}
              mode={mode}
              isProviderConfigured={providerStatus[provider]}
              onModeChange={setMode}
              onProviderChange={handleProviderChange}
              onModelChange={setModel}
              onKnobsChange={setKnobs}
              onBlocksChange={setBlocks}
              onSend={handleSend}
              isSending={isSending}
            />
          </div>
        </div>

        {/* Response Panel (overlays bottom) */}
        <AnimatePresence>
          {response && (
            <ResponsePanel
              response={response}
              onClose={() => setResponse(null)}
              onRetry={handleSend}
            />
          )}
        </AnimatePresence>

        {/* Send Modal */}
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendFromModal}
          blocks={blocks}
          initialProvider={provider}
          initialModel={model}
          initialKnobs={knobs}
          providerStatus={providerStatus}
        />
      </main>
    </BlueprintGrid>
  );
}
