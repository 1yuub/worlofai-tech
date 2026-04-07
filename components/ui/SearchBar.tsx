'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="relative">
      {open ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news…"
            className="w-48 sm:w-64 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" aria-label="Search" className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
            <Search size={18} />
          </button>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <Search size={18} />
        </button>
      )}
    </div>
  );
}
