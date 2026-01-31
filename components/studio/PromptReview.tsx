'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ArrowLeft,
  FileText,
  Code,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptBlock, ProviderId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PromptReviewProps {
  blocks: PromptBlock[];
  provider: ProviderId;
  model: string;
  onBack: () => void;
  className?: string;
}

type ExportFormat = 'text' | 'json' | 'markdown';

export function PromptReview({
  blocks,
  provider,
  model,
  onBack,
  className,
}: PromptReviewProps) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [includeHeadings, setIncludeHeadings] = useState(true);
  const { toast } = useToast();

  // Assemble the prompt from enabled blocks
  const assembledPrompt = useMemo(() => {
    return blocks
      .filter(b => b.enabled)
      .map(b => {
        if (includeHeadings) {
          return `## ${b.title}\n\n${b.content}`;
        }
        return b.content;
      })
      .join('\n\n---\n\n');
  }, [blocks, includeHeadings]);

  // Generate JSON export
  const jsonExport = useMemo(() => {
    return JSON.stringify(
      {
        provider,
        model,
        blocks: blocks.filter(b => b.enabled).map(b => ({
          type: b.type,
          title: b.title,
          content: b.content,
        })),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }, [blocks, provider, model]);

  // Generate markdown export
  const markdownExport = useMemo(() => {
    const header = `# Prompt Export\n\n**Provider:** ${provider}\n**Model:** ${model}\n**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
    const content = blocks
      .filter(b => b.enabled)
      .map(b => `## ${b.title}\n\n${b.content}`)
      .join('\n\n');
    return header + content;
  }, [blocks, provider, model]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleExport = (format: ExportFormat) => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = jsonExport;
        filename = 'prompt-export.json';
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = markdownExport;
        filename = 'prompt-export.md';
        mimeType = 'text/markdown';
        break;
      default:
        content = assembledPrompt;
        filename = 'prompt-export.txt';
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    toast({ title: `Exported as ${format.toUpperCase()}` });
  };

  const enabledBlocks = blocks.filter(b => b.enabled);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div
        className="shrink-0 px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2 text-ink-slate hover:text-ink-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Builder
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Include headings toggle */}
          <button
            onClick={() => setIncludeHeadings(!includeHeadings)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors',
              includeHeadings
                ? 'bg-glorpi-mint/10 text-glorpi-mint'
                : 'bg-white/5 text-ink-slate hover:text-ink-white'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Headings
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(!showExport)}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>

            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-40 py-1 rounded-lg z-20"
                style={{
                  backgroundColor: '#1a1e24',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                }}
              >
                <button
                  onClick={() => handleExport('text')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-graphite hover:text-ink-white hover:bg-white/5"
                >
                  <FileText className="w-4 h-4" />
                  Plain Text
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-graphite hover:text-ink-white hover:bg-white/5"
                >
                  <Code className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-graphite hover:text-ink-white hover:bg-white/5"
                >
                  <FileText className="w-4 h-4" />
                  Markdown
                </button>
              </motion.div>
            )}
          </div>

          {/* Primary copy button */}
          <Button onClick={handleCopy} size="sm" className="h-8">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy Prompt
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Review info bar */}
      <div
        className="shrink-0 px-4 py-2 flex items-center justify-between text-xs"
        style={{ backgroundColor: 'rgba(152, 215, 161, 0.05)' }}
      >
        <span className="text-ink-graphite">
          <span className="text-glorpi-mint font-medium">{enabledBlocks.length}</span> blocks •{' '}
          <span className="text-ink-muted">{provider} / {model}</span>
        </span>
        <span className="text-ink-muted">
          {assembledPrompt.length.toLocaleString()} characters
        </span>
      </div>

      {/* Assembled prompt view */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="rounded-xl p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            backgroundColor: '#12151a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#e8eaed',
          }}
        >
          {assembledPrompt || (
            <span className="text-ink-muted italic">
              No enabled blocks to display. Go back and enable some blocks.
            </span>
          )}
        </div>
      </div>

      {/* Block chips */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex flex-wrap gap-2">
          {enabledBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-2.5 py-1 rounded-md text-xs"
              style={{
                backgroundColor: 'rgba(152, 215, 161, 0.1)',
                color: '#98d7a1',
              }}
            >
              {block.title}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
