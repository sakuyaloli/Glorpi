import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/toaster';
import { derrick, inter } from './fonts';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Glorpi Prompt Studio',
  description: 'Build, estimate, and send prompts to multiple AI providers.',
  keywords: ['prompt engineering', 'AI', 'LLM', 'Claude', 'GPT', 'Gemini'],
  authors: [{ name: 'Glorpi' }],
  openGraph: {
    title: 'Glorpi Prompt Studio',
    description: 'Build, estimate, and send prompts.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0e11',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${derrick.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: 'dark', backgroundColor: '#0c0e11' }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.style.backgroundColor='#0c0e11';document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className="font-ui antialiased min-h-screen" style={{ backgroundColor: '#0c0e11', color: '#e8eaed' }}>
        {/* Live2D Cubism 4 SDK Core */}
        <Script
          src="/live2d/live2dcubismcore.min.js"
          strategy="beforeInteractive"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
