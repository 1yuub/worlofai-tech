'use client';

import { TrendingUp, Zap } from 'lucide-react';

const TICKERS = [
  { symbol: 'BTC', label: 'Bitcoin' },
  { symbol: 'ETH', label: 'Ethereum' },
  { symbol: 'SOL', label: 'Solana' },
  { symbol: 'NVDA', label: 'NVIDIA' },
  { symbol: 'AAPL', label: 'Apple' },
  { symbol: 'MSFT', label: 'Microsoft' },
  { symbol: 'GOOGL', label: 'Google' },
  { symbol: 'AMZN', label: 'Amazon' },
];

export function TickerBanner() {
  return (
    <div className="bg-gray-900 dark:bg-black border-b border-gray-800 overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold">
          <Zap size={11} />
          LIVE
        </div>
        <div className="relative overflow-hidden flex-1">
          <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs py-1.5 px-4 text-gray-300">
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <TrendingUp size={10} className="text-green-400" />
                <span className="font-semibold text-white">{t.symbol}</span>
                <span className="text-gray-400">{t.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
