import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Vibe SaaS - Modern SaaS Starter Kit',
    template: '%s | Vibe SaaS',
  },
  description:
    'Production-ready Next.js SaaS starter kit with authentication, billing, roles, dashboards, and AI-powered features.',
  keywords: [
    'SaaS',
    'Next.js',
    'React',
    'TypeScript',
    'Stripe',
    'Authentication',
    'Starter Kit',
  ],
  authors: [{ name: 'Vibe SaaS' }],
  creator: 'Vibe SaaS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Vibe SaaS',
    title: 'Vibe SaaS - Modern SaaS Starter Kit',
    description:
      'Production-ready Next.js SaaS starter kit with authentication, billing, roles, dashboards, and AI-powered features.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe SaaS - Modern SaaS Starter Kit',
    description:
      'Production-ready Next.js SaaS starter kit with authentication, billing, roles, dashboards, and AI-powered features.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
