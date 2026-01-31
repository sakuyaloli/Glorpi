import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Glorpi Design System - Brand green #98d7a1
        glorpi: {
          mint: '#98d7a1',
          'mint-light': '#b5e6bc',
          'mint-dark': '#7bc98a',
        },
        accent: {
          orange: '#f0a060',
          'orange-light': '#ffc799',
          'orange-dark': '#d88840',
        },
        // Surfaces
        canvas: {
          dark: '#0c0e11',
          darker: '#080a0c',
          card: '#12151a',
          elevated: '#1a1e24',
        },
        // Text
        ink: {
          charcoal: '#0c0e11',
          graphite: '#9ca3af',
          slate: '#6b7280',
          muted: '#4b5563',
          white: '#e8eaed',
        },
        // Validation
        validation: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // shadcn compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.25)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'glow': '0 0 24px rgba(152, 215, 161, 0.2)',
        'glow-sm': '0 0 12px rgba(152, 215, 161, 0.15)',
        'panel': '0 2px 8px rgba(0, 0, 0, 0.25)',
        'panel-lg': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'btn': '0 1px 3px rgba(0, 0, 0, 0.2)',
        'btn-hover': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(152, 215, 161, 0.15)',
        'inner-soft': 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
