import { Suspense } from 'react';
import TrackOrder from '@/views/TrackOrder';

export const metadata = {
  title: 'Track Your Order | Yellow Tea',
  description: 'Track the delivery status and location of your Yellow Tea order.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tracking...</div>}>
      <TrackOrder />
    </Suspense>
  );
}
