'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Cpu,
  User,
  Target,
  Shield,
  FileText,
  List,
  Wrench,
  CheckSquare,
  Terminal,
  Palette,
  Accessibility,
  TestTube,
  Rocket,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blockTypeConfig } from '@/lib/templates';
import type { PromptBlock, BlockType } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { formatTokenCount } from '@/lib/token-estimation';

const iconMap: Record<string, React.ElementType> = {
  cpu: Cpu,
  user: User,
  target: Target,
  shield: Shield,
  'file-text': FileText,
  list: List,
  wrench: Wrench,
  'check-square': CheckSquare,
  terminal: Terminal,
  palette: Palette,
  accessibility: Accessibility,
  'test-tube': TestTube,
  rocket: Rocket,
  plus: Plus,
};

interface SpecNodeCardProps {
  block: PromptBlock;
  onUpdate: (id: string, updates: Partial<PromptBlock>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function SpecNodeCard({ block, onUpdate, onDelete, onDuplicate }: SpecNodeCardProps) {
  const config = blockTypeConfig[block.type] || blockTypeConfig.custom;
  const Icon = iconMap[config.icon] || Plus;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'group relative rounded-xl transition-all duration-200',
        'bg-gradient-to-b from-white/[0.04] to-transparent',
        isDragging 
          ? 'z-50 shadow-panel-lg scale-[1.02] border-2 border-glorpi-mint/40' 
          : 'shadow-panel hover:shadow-panel-lg border border-white/[0.08] hover:border-white/[0.12]',
        block.enabled
          ? 'bg-canvas-card'
          : 'bg-canvas-darker/50 opacity-60',
        block.locked && 'border-accent-orange/30 ring-1 ring-accent-orange/20'
      )}
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rounded-t-xl" />
      
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 border-b',
          block.enabled ? 'border-white/[0.06]' : 'border-white/[0.03]',
          'bg-gradient-to-b from-white/[0.02] to-transparent'
        )}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-white/10 cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink-graphite"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Type icon */}
        <div className={cn('p-1.5 rounded-md bg-white/5', config.color)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Title */}
        <input
          type="text"
          value={block.title}
          onChange={(e) => onUpdate(block.id, { title: e.target.value })}
          className="flex-1 text-sm font-medium text-white bg-transparent border-none focus:outline-none focus:ring-0"
          disabled={block.locked}
        />

        {/* Token count badge */}
        {block.tokenCount !== undefined && block.enabled && (
          <div className="px-2 py-0.5 text-2xs font-mono rounded bg-white/5 text-ink-graphite">
            {formatTokenCount(block.tokenCount)} tokens
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdate(block.id, { enabled: !block.enabled })}
                >
                  {block.enabled ? (
                    <Eye className="w-3.5 h-3.5 text-glorpi-mint" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-ink-muted" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{block.enabled ? 'Disable' : 'Enable'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdate(block.id, { locked: !block.locked })}
                >
                  {block.locked ? (
                    <Lock className="w-3.5 h-3.5 text-accent-orange" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-ink-muted" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{block.locked ? 'Unlock' : 'Lock'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDuplicate(block.id)}
                >
                  <Copy className="w-3.5 h-3.5 text-ink-muted" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDelete(block.id)}
                  disabled={block.locked}
                >
                  <Trash2 className="w-3.5 h-3.5 text-validation-error" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => onUpdate(block.id, { collapsed: !block.collapsed })}
          className="p-1 rounded hover:bg-white/10 text-ink-muted hover:text-ink-graphite"
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              block.collapsed && '-rotate-90'
            )}
          />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!block.collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              <Textarea
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder={`Enter ${config.label.toLowerCase()} content...`}
                className="min-h-[100px] text-sm font-mono resize-y"
                disabled={block.locked}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked indicator */}
      {block.locked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-orange" />
      )}
    </motion.div>
  );
}
