import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

// Display font - DERRICK for brand/hero headings only
export const derrick = localFont({
  src: '../public/DERRICK.ttf',
  variable: '--font-display',
  display: 'swap',
});

// UI font - Inter for all interface text
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});
