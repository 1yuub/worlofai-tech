import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TickerBanner } from '@/components/ui/TickerBanner';

export const metadata: Metadata = {
  title: {
    default: 'WorldOfAI.tech — Tech, AI & Crypto News',
    template: '%s | WorldOfAI.tech',
  },
  description:
    'Stay ahead with the latest Tech, AI, Crypto, and Developer news aggregated from trusted sources in real time.',
  keywords: ['tech news', 'AI news', 'crypto news', 'developer news', 'technology'],
  metadataBase: new URL('https://worlofai.tech'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://worlofai.tech',
    siteName: 'WorldOfAI.tech',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@worlofaitech',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * ── GOOGLE ADSENSE ──────────────────────────────────────────────
         * To activate AdSense:
         * 1. Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID to .env.local
         * 2. Uncomment the script tag below and replace YOUR_PUBLISHER_ID
         * 3. See ADSENSE_GUIDE.md for full setup instructions
         *
         * <script
         *   async
         *   src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
         *   crossOrigin="anonymous"
         * />
         * ────────────────────────────────────────────────────────────────
         */}
      </head>
      <body className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <TickerBanner />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
