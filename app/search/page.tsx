import { Suspense } from 'react';
import { SearchResults } from './SearchResults';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Search — WorldOfAI.tech',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
