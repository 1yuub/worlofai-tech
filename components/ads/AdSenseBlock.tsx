'use client';

/* ============================================================
 * AdSenseBlock.tsx
 * ============================================================
 * This component renders Google AdSense ad units.
 *
 * TO ACTIVATE ADS:
 * 1. Add NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX to .env.local
 * 2. Update the slotMap below with your real slot IDs from AdSense dashboard
 * 3. Add the AdSense script to app/layout.tsx (see ADSENSE_GUIDE.md)
 * ============================================================
 */

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

// ── AD SLOT MAPPING ────────────────────────────────────────────────────────
// Replace values with your actual AdSense slot IDs
const slotMap: Record<string, string> = {
  'top-horizontal': 'YOUR_SLOT_ID_1',     // 728x90 leaderboard – top of page
  'middle-horizontal': 'YOUR_SLOT_ID_2',  // 300x250 rectangle  – between articles
  'bottom-horizontal': 'YOUR_SLOT_ID_3',  // 728x90 leaderboard – bottom of page
  'sidebar-vertical': 'YOUR_SLOT_ID_4',   // 300x600 half-page   – sidebar
};
// ──────────────────────────────────────────────────────────────────────────

interface AdSenseBlockProps {
  slot: keyof typeof slotMap;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSenseBlock({ slot, className }: AdSenseBlockProps) {
  const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  const slotId = slotMap[slot];

  useEffect(() => {
    if (!publisherId || !slotId || slotId.startsWith('YOUR_')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[AdSense] Push failed:', e);
    }
  }, [publisherId, slotId]);

  if (!publisherId || slotId.startsWith('YOUR_')) {
    // ── AD PLACEHOLDER (shown until AdSense is configured) ──
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-xs font-medium',
          slot.includes('sidebar') ? 'h-[600px] w-[300px]' : 'h-[90px] w-full',
          className,
        )}
        aria-label="Ad space reserved"
      >
        <span>Ad • {slot}</span>
      </div>
    );
  }

  // ── LIVE ADSENSE UNIT ─────────────────────────────────────────────────────
  return (
    <div className={cn('overflow-hidden', className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={slot.includes('sidebar') ? 'vertical' : 'horizontal'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
