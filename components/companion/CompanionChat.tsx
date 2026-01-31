'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Zap,
  Wand2,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  CompanionMessage, 
  CompanionSuggestion, 
  PromptBlock, 
  PromptPlan, 
  ProviderId,
  CompanionPlanResponse,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TextareaAutosize from 'react-textarea-autosize';
import { v4 as uuid } from 'uuid';

interface CompanionChatProps {
  onApplySuggestion: (suggestion: CompanionSuggestion) => void;
  onApplyPlan?: (plan: PromptPlan) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
  currentBlocks?: PromptBlock[];
  provider?: ProviderId;
  model?: string;
  className?: string;
}

// Pre-defined smart suggestions based on common prompt building needs
const SMART_SUGGESTIONS = [
  'Build me a code review assistant',
  'Create a data extraction prompt for JSON',
  'Help me write a creative writing coach',
];

export function CompanionChat({ 
  onApplySuggestion, 
  onApplyPlan,
  onGeneratingChange,
  currentBlocks = [],
  provider,
  model,
  className,
}: CompanionChatProps) {
  const [messages, setMessages] = useState<CompanionMessage[]>([
    {
      id: uuid(),
      role: 'assistant',
      content:
        "Hello! I'm Glorpi, your prompt engineering companion. Tell me what you want to build, and I'll generate structured blocks for you automatically. Try: \"Build me a code review assistant\" or \"Create a JSON data extractor\"",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingBlocks, setIsGeneratingBlocks] = useState(false);
  const [autoApply, setAutoApply] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  // Notify parent when generating state changes
  useEffect(() => {
    onGeneratingChange?.(isGeneratingBlocks);
  }, [isGeneratingBlocks, onGeneratingChange]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Call the AI-powered plan endpoint
  const generateAIPlan = async (userMessage: string): Promise<CompanionPlanResponse> => {
    const response = await fetch('/api/companion/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        currentBlocks,
        provider,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: CompanionMessage = {
      id: uuid(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setLastError(null);

    try {
      // Show generating blocks indicator
      setIsGeneratingBlocks(true);

      // Call the AI plan endpoint
      const result = await generateAIPlan(userMessage.content);

      // Add the chat reply (NOT the generated prompt) to messages
      const assistantMessage: CompanionMessage = {
        id: uuid(),
        role: 'assistant',
        content: result.chatReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If we got a plan and auto-apply is on, apply it to the builder
      if (result.plan && onApplyPlan && autoApply) {
        onApplyPlan(result.plan);
      } else if (result.plan && !autoApply) {
        // If auto-apply is off, add as suggestion buttons
        const suggestions: CompanionSuggestion[] = result.plan.blocks.map((block) => ({
          id: uuid(),
          type: 'add_block',
          title: `Add ${block.heading}`,
          description: block.content.substring(0, 60) + '...',
          blockType: block.type as any,
          blockContent: block.content,
        }));

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            suggestions,
          };
          return updated;
        });
      }

      if (result.error) {
        setLastError(result.error);
      }
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: 'assistant',
          content: "I had trouble generating blocks. Please try again or check if the API key is configured in Settings.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsGeneratingBlocks(false);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-canvas-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-glorpi-mint/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-glorpi-mint" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Glorpi</h3>
              <p className="text-2xs text-ink-muted">AI Block Generator</p>
            </div>
          </div>
          
          {/* Auto-apply toggle */}
          <button
            onClick={() => setAutoApply(!autoApply)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
              autoApply 
                ? 'text-glorpi-mint bg-glorpi-mint/10' 
                : 'text-ink-muted hover:text-ink-white'
            )}
            title={autoApply ? 'Auto-apply blocks to builder' : 'Show blocks as suggestions'}
          >
            {autoApply ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Auto</span>
          </button>
        </div>
      </div>

      {/* Generating blocks indicator */}
      <AnimatePresence>
        {isGeneratingBlocks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div 
              className="px-4 py-2 flex items-center gap-2 text-xs"
              style={{ backgroundColor: 'rgba(152, 215, 161, 0.1)' }}
            >
              <Loader2 className="w-3.5 h-3.5 text-glorpi-mint animate-spin" />
              <span className="text-glorpi-mint">Glorpi is drafting blocks...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-glorpi-mint text-ink-charcoal'
                      : 'bg-canvas-card border border-white/10 text-white'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Suggestions (shown when auto-apply is off) */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => onApplySuggestion(suggestion)}
                          className="w-full text-left p-2 rounded-md bg-glorpi-mint/10 hover:bg-glorpi-mint/20 border border-glorpi-mint/30 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <Wand2 className="w-4 h-4 text-glorpi-mint mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-glorpi-mint">
                                {suggestion.title}
                              </p>
                              <p className="text-xs text-ink-graphite mt-0.5 line-clamp-2">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && !isGeneratingBlocks && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-canvas-card border border-white/10 rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-glorpi-mint animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-glorpi-mint animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-glorpi-mint animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error with retry */}
          {lastError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-validation-error/10 text-validation-error border border-validation-error/20 hover:bg-validation-error/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick suggestions */}
      <div className="px-4 py-2 border-t border-white/10 bg-canvas-darker">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SMART_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="shrink-0 px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 hover:border-glorpi-mint hover:text-glorpi-mint transition-colors text-ink-graphite"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-canvas-card">
        <div className="flex gap-2">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell Glorpi what to build..."
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 text-sm rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-glorpi-mint resize-none"
            maxRows={4}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
