'use client';

import {
  Layers,
  Gauge,
  Shield,
  Zap,
  Lock,
  BookOpen,
} from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { BlueprintGrid } from '@/components/design/BlueprintGrid';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sections = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'Overview',
    content: `Glorpi Prompt Studio is a visual prompt engineering tool that helps you build, validate, estimate, and send prompts to multiple AI providers.

Key features:
• Visual Builder – Compose prompts using modular blocks
• Token Estimation – Real-time token counting and cost estimation
• Validation – Automatic safety and quality checks
• Multi-Provider – Support for Claude, GPT, Gemini, DeepSeek`,
  },
  {
    id: 'builder',
    icon: Layers,
    title: 'Prompt Builder',
    content: `The visual prompt builder lets you compose prompts using structured blocks:

Block Types:
• System – Core instructions and persona
• Role – Specific expertise to embody
• Goal – Primary objective
• Constraints – Boundaries and limitations
• Output Format – Expected response structure
• Examples – Few-shot examples

Features:
• Drag-and-drop reordering
• Collapse/expand blocks
• Lock critical blocks
• Enable/disable without deleting`,
  },
  {
    id: 'estimation',
    icon: Gauge,
    title: 'Token Estimation',
    content: `Get real-time cost estimates as you build your prompts.

How it works:
• Character-to-token ratio calculated per provider
• Structural overhead automatically accounted for
• Per-block breakdown shows where tokens are used

Cost Calculation:
• Input tokens × provider rate per million
• Output tokens × provider rate per million
• Prices sourced from official documentation`,
  },
  {
    id: 'validation',
    icon: Shield,
    title: 'Preflight Checks',
    content: `Before sending, the validation engine checks for common issues:

Safety Checks:
• Prompt injection patterns
• Jailbreak attempt detection
• Leaky system prompt patterns

Quality Checks:
• Missing system block warning
• Empty content detection
• Conflicting instructions
• JSON validity for structured outputs`,
  },
  {
    id: 'providers',
    icon: Zap,
    title: 'Provider Setup (BYOK)',
    content: `Bring Your Own Key (BYOK) to use your preferred providers.

Supported Providers:
• Anthropic – Claude 3, Claude 3.5 Sonnet
• OpenAI – GPT-4, GPT-4o (included free tier available)
• Google – Gemini 1.5 Pro, Gemini 1.5 Flash
• DeepSeek – DeepSeek Chat, DeepSeek Coder
• Any OpenAI-compatible endpoint

Go to Settings to add your API keys. Keys are stored locally in your browser and never sent to our servers.`,
  },
  {
    id: 'privacy',
    icon: Lock,
    title: 'Privacy & Security',
    content: `Your data stays yours.

API Keys:
• Stored locally in your browser (localStorage)
• Never sent to our servers
• Never logged or tracked

Your Prompts:
• Stored locally in IndexedDB
• Only sent directly to your chosen AI provider
• No telemetry or analytics on prompt content

You can clear all stored data anytime from Settings.`,
  },
];

export default function DocsPage() {
  return (
    <BlueprintGrid className="min-h-screen">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-ink-white mb-2">Documentation</h1>
            <p className="text-sm text-ink-graphite">
              Learn how to use Glorpi Prompt Studio.
            </p>
          </div>

          {/* Quick nav */}
          <div className="docs-nav-surface p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-ink-slate hover:text-glorpi-mint hover:bg-glorpi-mint/5 transition-all duration-200"
                >
                  <section.icon className="w-3.5 h-3.5" />
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <Accordion type="single" collapsible className="space-y-3">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                id={section.id}
                className="docs-accordion-item overflow-hidden border-0"
              >
                <AccordionTrigger className="docs-accordion-trigger px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="docs-icon-badge w-9 h-9 rounded-xl flex items-center justify-center">
                      <section.icon className="w-4 h-4 text-glorpi-mint" />
                    </div>
                    <span className="text-sm font-medium text-ink-white">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="docs-accordion-content">
                  <div className="docs-content-panel">
                    <div className="docs-content-text">
                      {section.content}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </BlueprintGrid>
  );
}
