import { Suspense } from 'react';
import Wishlist from '@/views/Wishlist';

export const metadata = {
  title: 'Your Wishlist | Yellow Tea',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading wishlist...</div>}>
      <Wishlist />
    </Suspense>
  );
}
