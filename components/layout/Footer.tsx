'use client';

import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer 
      className="border-t"
      style={{ 
        backgroundColor: '#0c0e11',
        borderColor: 'rgba(255, 255, 255, 0.06)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <span className="text-sm font-medium text-ink-white">
            Glorpi Prompt Studio
          </span>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-ink-slate">
            <Link href="/docs" className="hover:text-glorpi-mint transition-colors">
              Docs
            </Link>
            <Link href="/settings" className="hover:text-glorpi-mint transition-colors">
              Settings
            </Link>
            <a
              href="https://github.com/glorpi/prompt-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-glorpi-mint transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/glorpi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-glorpi-mint transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
