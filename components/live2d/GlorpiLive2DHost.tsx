'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Expression type matching the renderer
type GlorpiExpression = 'question' | 'cry' | 'eye_glow' | 'fluff' | 'neutral';

// Dynamic import with SSR disabled - CRITICAL for browser-only code
const GlorpiLive2DRenderer = dynamic(
  () => import('./GlorpiLive2DRenderer').then((mod) => mod.GlorpiLive2DRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-canvas-darker rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-glorpi-mint animate-spin" />
          <span className="text-xs text-ink-muted">Loading Live2D...</span>
        </div>
      </div>
    ),
  }
);

interface GlorpiLive2DHostProps {
  className?: string;
  debug?: boolean;
  // Expression control props
  hasError?: boolean;     // Blocking issue in preflight -> question
  hasWarning?: boolean;   // Warning in preflight -> cry
  isGenerating?: boolean; // Anthropic generating blocks -> eye_glow
}

export function GlorpiLive2DHost({ 
  className, 
  debug = false,
  hasError = false,
  hasWarning = false,
  isGenerating = false,
}: GlorpiLive2DHostProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [fluffToggle, setFluffToggle] = useState(false);

  // Check for debug query param
  const urlDebug = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).has('live2dDebug');
  const debugEnabled = debug || urlDebug;

  // Expression controller with priority:
  // 1) eye_glow (generating) - highest
  // 2) question (error) 
  // 3) cry (warning)
  // 4) fluff (toggle) - lowest/persistent
  // 5) neutral
  const currentExpression = useMemo<GlorpiExpression>(() => {
    if (isGenerating) return 'eye_glow';
    if (hasError) return 'question';
    if (hasWarning) return 'cry';
    if (fluffToggle) return 'fluff';
    return 'neutral';
  }, [isGenerating, hasError, hasWarning, fluffToggle]);

  // Mood indicator derived from expression
  const mood = useMemo(() => {
    switch (currentExpression) {
      case 'eye_glow': return 'thinking';
      case 'question': return 'concerned';
      case 'cry': return 'concerned';
      case 'fluff': return 'excited';
      default: return 'happy';
    }
  }, [currentExpression]);

  const moodColors: Record<string, string> = {
    happy: 'bg-validation-success',
    thinking: 'bg-validation-info',
    concerned: 'bg-validation-warning',
    excited: 'bg-accent-orange',
  };

  const handleContainerClick = () => {
    setFluffToggle(prev => !prev);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-b from-canvas-card to-canvas-darker border border-white/[0.08] shadow-panel',
        className
      )}
    >
      {/* Top bar with controls */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        {/* Debug toggle (left) */}
        {debugEnabled && (
          <button
            onClick={() => setShowDebug((s) => !s)}
            className={cn(
              'p-1.5 rounded-lg transition-colors pointer-events-auto',
              showDebug 
                ? 'bg-glorpi-mint/20 text-glorpi-mint' 
                : 'bg-black/40 text-ink-muted hover:bg-black/50'
            )}
            title="Toggle debug overlay"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
        {!debugEnabled && <div />}

        {/* Mood indicator (right) */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          <motion.div
            className={cn('w-2 h-2 rounded-full', moodColors[mood])}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-2xs text-ink-slate capitalize">{mood}</span>
        </div>
      </div>

      {/* Fluff toggle indicator (shows when active) */}
      {fluffToggle && (
        <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded-full bg-accent-orange/20 text-2xs text-accent-orange">
          fluff ✨
        </div>
      )}

      {/* Retry button (debug mode only) */}
      {debugEnabled && (
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="absolute bottom-2 right-2 z-20 p-1.5 rounded-lg bg-black/40 text-ink-muted hover:bg-black/50 transition-colors"
          title="Force reload"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}

      {/* The actual Live2D renderer */}
      <GlorpiLive2DRenderer
        key={retryKey}
        showDebug={showDebug}
        onCloseDebug={() => setShowDebug(false)}
        expression={currentExpression}
        onContainerClick={handleContainerClick}
      />
    </div>
  );
}
