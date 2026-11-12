import { Suspense } from 'react';
import Search from '@/views/Search';

export const metadata = {
  title: 'Search Teas & Flavors | Yellow Tea',
  description: 'Search for whole leaf Indian teas, flushes, estates, and herbal blends on Yellow Tea.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Searching...</div>}>
      <Search />
    </Suspense>
  );
}
