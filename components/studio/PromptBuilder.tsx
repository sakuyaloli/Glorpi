'use client';

import { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, FileDown, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptBlock, BlockType } from '@/lib/types';
import { blockTypeConfig, promptTemplates } from '@/lib/templates';
import { estimateTokensForBlock } from '@/lib/token-estimation';
import { SpecNodeCard } from '@/components/design/SpecNodeCard';
import { GlassPanel } from '@/components/design/GlassPanel';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { v4 as uuid } from 'uuid';

interface PromptBuilderProps {
  blocks: PromptBlock[];
  onBlocksChange: (blocks: PromptBlock[]) => void;
  provider: string;
  className?: string;
}

const blockTypes: BlockType[] = [
  'system',
  'role',
  'goal',
  'constraints',
  'output_format',
  'examples',
  'tools',
  'evaluation',
  'environment',
  'ui_aesthetic',
  'accessibility',
  'testing',
  'deployment',
  'custom',
];

export function PromptBuilder({ blocks, onBlocksChange, provider, className }: PromptBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate token counts for each block
  const blocksWithTokens = useMemo(() => {
    return blocks.map((block) => ({
      ...block,
      tokenCount: estimateTokensForBlock(block, provider as any),
    }));
  }, [blocks, provider]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
      }
    },
    [blocks, onBlocksChange]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<PromptBlock>) => {
      onBlocksChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    },
    [blocks, onBlocksChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onBlocksChange(blocks.filter((b) => b.id !== id));
    },
    [blocks, onBlocksChange]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.id === id);
      if (block) {
        const index = blocks.indexOf(block);
        const newBlock = { ...block, id: uuid(), title: `${block.title} (copy)` };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onBlocksChange(newBlocks);
      }
    },
    [blocks, onBlocksChange]
  );

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const config = blockTypeConfig[type];
      const newBlock: PromptBlock = {
        id: uuid(),
        type,
        title: config.label,
        content: '',
        enabled: true,
        locked: false,
        collapsed: false,
      };
      onBlocksChange([...blocks, newBlock]);
    },
    [blocks, onBlocksChange]
  );

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const template = promptTemplates.find((t) => t.id === templateId);
      if (template) {
        const newBlocks = template.blocks.map((b) => ({
          ...b,
          id: uuid(),
        }));
        onBlocksChange(newBlocks);
      }
    },
    [onBlocksChange]
  );

  const handleExport = useCallback(() => {
    const enabledBlocks = blocks.filter((b) => b.enabled);
    const text = enabledBlocks
      .map((b) => {
        const header = b.title ? `## ${b.title}\n` : '';
        return header + b.content;
      })
      .join('\n\n');

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [blocks]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="shrink-0 px-4 py-3 border-b border-white/10 bg-canvas-card flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-glorpi-mint" />
          <h2 className="font-medium text-white">Prompt Builder</h2>
          <span className="text-xs text-ink-muted">
            {blocks.filter((b) => b.enabled).length} blocks active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Template selector */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <LayoutTemplate className="w-4 h-4 mr-1" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Load Template</DialogTitle>
                <DialogDescription>
                  Start with a pre-built template. This will replace your current blocks.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {promptTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      handleLoadTemplate(template.id);
                    }}
                    className="text-left p-3 rounded-lg border border-white/10 hover:border-glorpi-mint hover:bg-glorpi-mint/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{template.name}</p>
                        <p className="text-sm text-ink-graphite mt-0.5">{template.description}</p>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded bg-white/5 text-ink-muted">
                        {template.category}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {template.blocks.slice(0, 4).map((b, i) => (
                        <span
                          key={i}
                          className="text-2xs px-1.5 py-0.5 rounded bg-glorpi-mint/10 text-glorpi-mint"
                        >
                          {b.type}
                        </span>
                      ))}
                      {template.blocks.length > 4 && (
                        <span className="text-2xs text-ink-muted">
                          +{template.blocks.length - 4} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Add block dropdown */}
          <Select onValueChange={(v) => handleAddBlock(v as BlockType)}>
            <SelectTrigger className="w-[140px] h-8">
              <div className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>Add Block</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Block Types</SelectLabel>
                {blockTypes.map((type) => {
                  const config = blockTypeConfig[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs', config.color)}>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Export */}
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <FileDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Builder canvas */}
      <ScrollArea className="flex-1">
        <div className="p-4 min-h-full">
          {blocks.length === 0 ? (
            <GlassPanel variant="placard" className="text-center py-12">
              <Layers className="w-12 h-12 mx-auto text-ink-muted mb-4" />
              <h3 className="font-medium text-white mb-2">No blocks yet</h3>
              <p className="text-sm text-ink-graphite mb-4">
                Add blocks to start building your prompt, or load a template
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => handleAddBlock('system')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add System Block
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <LayoutTemplate className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Load Template</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      {promptTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleLoadTemplate(template.id)}
                          className="text-left p-3 rounded-lg border border-white/10 hover:border-glorpi-mint hover:bg-glorpi-mint/5 transition-colors"
                        >
                          <p className="font-medium text-white">{template.name}</p>
                          <p className="text-sm text-ink-graphite">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </GlassPanel>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {blocksWithTokens.map((block) => (
                      <SpecNodeCard
                        key={block.id}
                        block={block}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
