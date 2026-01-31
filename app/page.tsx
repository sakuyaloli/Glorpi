'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { BlueprintGrid } from '@/components/design/BlueprintGrid';
import { HomeStudioPreview } from '@/components/home/HomeStudioPreview';

export default function HomePage() {
  return (
    <BlueprintGrid className="min-h-screen">
      <Navigation />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 md:px-8 lg:px-12 pt-14">
        {/* Glow orb */}
        <motion.div
          className="absolute orb-drift pointer-events-none"
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(152, 215, 161, 0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '25%',
            left: '25%',
            zIndex: 0,
          }}
        />

        {/* Two-column hero - larger, more screen usage */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left column: Text + CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center lg:text-left max-w-xl lg:max-w-none"
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-ink-white mb-5 leading-[0.95] tracking-[-0.02em]">
                Glorpi
              </h1>
              <p className="font-ui text-ink-graphite text-lg md:text-xl lg:text-[22px] mb-10 max-w-md lg:max-w-lg">
                Build, estimate, and send prompts.
              </p>

              {/* CTAs - better aligned */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <Link href="/studio">
                  <motion.button
                    className="glow-btn flex items-center gap-2 text-base md:text-lg px-7 py-3.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Open Studio
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </Link>
                <Link 
                  href="/docs"
                  className="inline-flex items-center text-sm md:text-base text-ink-slate hover:text-glorpi-mint transition-colors h-[52px] px-2"
                >
                  Read the docs →
                </Link>
              </div>
            </motion.div>

            {/* Right column: Preview - larger */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-1 w-full max-w-md lg:max-w-lg"
            >
              <HomeStudioPreview />
            </motion.div>
          </div>

          {/* Feature crumbs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-20 lg:mt-24 flex items-center justify-center gap-6 md:gap-8 text-xs md:text-sm text-ink-muted/70"
          >
            <span>Token estimation</span>
            <span className="w-1 h-1 rounded-full bg-ink-muted/30" />
            <span>Preflight checks</span>
            <span className="w-1 h-1 rounded-full bg-ink-muted/30" />
            <span>Multi-provider</span>
          </motion.div>
        </div>
      </main>
    </BlueprintGrid>
  );
}
