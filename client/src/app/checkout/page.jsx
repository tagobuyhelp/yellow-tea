import { Suspense } from 'react';
import Checkout from '@/views/Checkout';

export const metadata = {
  title: 'Secure Checkout | Yellow Tea',
  description: 'Complete your Yellow Tea order securely.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <Checkout />
    </Suspense>
  );
}
