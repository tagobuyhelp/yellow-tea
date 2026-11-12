import { Suspense } from 'react';
import Cart from '@/views/Cart';

export const metadata = {
  title: 'Your Cart | Yellow Tea',
  description: 'View items in your Yellow Tea cart and proceed to secure checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading cart...</div>}>
      <Cart />
    </Suspense>
  );
}
