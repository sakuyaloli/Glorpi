'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mini block data
const blocks = [
  { id: 'system', label: 'System', color: '#98d7a1', content: 'You are a helpful assistant...' },
  { id: 'goal', label: 'Goal', color: '#f0a060', content: '' }, // This will be typed
  { id: 'output', label: 'Output Format', color: '#6b9fff', content: 'Respond in JSON format' },
];

// Typewriter text to cycle through
const typewriterTexts = [
  'Help users write better code',
  'Explain complex concepts clearly',
  'Generate creative solutions',
];

export function HomeStudioPreview() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [tokenCount, setTokenCount] = useState(42);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reorderTrigger, setReorderTrigger] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const targetText = typewriterTexts[currentTextIndex];
    
    if (!isDeleting) {
      // Typing
      if (displayedText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(targetText.slice(0, displayedText.length + 1));
          setTokenCount(prev => prev + 1);
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        // Done typing, wait then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setReorderTrigger(prev => prev + 1);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
          setTokenCount(prev => Math.max(42, prev - 1));
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        // Done deleting, move to next text
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
    }
  }, [displayedText, isDeleting, currentTextIndex]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#12151a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-validation-error/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-validation-warning/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-validation-success/60" />
        </div>
        <span className="text-xs text-ink-muted font-mono">prompt.glp</span>
      </div>

      {/* Blocks area - larger padding */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: block.id === 'goal' && reorderTrigger > 0 ? [0, -4, 0] : 0,
              }}
              transition={{ 
                duration: 0.4,
                ease: 'easeOut',
                x: { duration: 0.6, ease: 'easeInOut' }
              }}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Block header */}
              <div
                className="flex items-center gap-2.5 px-3 py-2"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: block.color }}
                />
                <span className="text-xs font-medium text-ink-graphite">
                  {block.label}
                </span>
              </div>

              {/* Block content */}
              <div className="px-3 py-2.5">
                <p className="text-xs text-ink-slate leading-relaxed">
                  {block.id === 'goal' ? (
                    <>
                      {displayedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-px h-3.5 bg-glorpi-mint ml-0.5 align-middle"
                      />
                    </>
                  ) : (
                    block.content
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer with token counter */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <span className="text-xs text-ink-muted">3 blocks</span>
        <motion.div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: 'rgba(152, 215, 161, 0.1)' }}
        >
          <span className="text-xs text-glorpi-mint font-mono font-medium">
            {tokenCount}
          </span>
          <span className="text-xs text-ink-muted">tokens</span>
        </motion.div>
      </div>
    </div>
  );
}
