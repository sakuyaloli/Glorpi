'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Layers,
  Database,
  Settings,
  BookOpen,
  Menu,
  X,
  Github,
  Twitter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand/LogoMark';
import { useState } from 'react';

const navItems = [
  { href: '/studio', label: 'Studio', icon: Layers },
  { href: '/models', label: 'Models', icon: Database },
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Background */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(12, 14, 17, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              <LogoMark size="md" />
            </motion.div>
            <span className="font-display text-[19px] leading-none tracking-[-0.01em] text-ink-white group-hover:text-glorpi-mint transition-colors">
              Glorpi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'text-glorpi-mint'
                      : 'text-ink-slate hover:text-ink-white'
                  )}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: 'rgba(152, 215, 161, 0.1)' }}
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Social + CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Social icons */}
            <a
              href="https://github.com/glorpi/prompt-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="quiet-icon-btn"
              aria-label="GitHub"
            >
              <Github className="w-[18px] h-[18px]" />
            </a>
            <a
              href="https://x.com/glorpi"
              target="_blank"
              rel="noopener noreferrer"
              className="quiet-icon-btn"
              aria-label="Twitter"
            >
              <Twitter className="w-[18px] h-[18px]" />
            </a>
            
            {/* Divider */}
            <div className="w-px h-5 bg-white/10 mx-1" />
            
            {/* CTA */}
            <Link href="/studio">
              <Button 
                size="sm" 
                className="h-8 px-3 text-sm font-medium bg-glorpi-mint hover:bg-glorpi-mint-dark text-canvas-dark shadow-btn hover:shadow-btn-hover transition-all"
              >
                Open Studio
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden"
          style={{ 
            backgroundColor: 'rgba(12, 14, 17, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-glorpi-mint'
                      : 'text-ink-slate hover:text-ink-white hover:bg-white/5'
                  )}
                  style={isActive ? { backgroundColor: 'rgba(152, 215, 161, 0.1)' } : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile social links */}
            <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-white/10">
              <a
                href="https://github.com/glorpi/prompt-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="quiet-icon-btn"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/glorpi"
                target="_blank"
                rel="noopener noreferrer"
                className="quiet-icon-btn"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
