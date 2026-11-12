import { Suspense } from 'react';
import TrackOrder from '@/views/TrackOrder';

export const metadata = {
  title: 'Tracking Details | Yellow Tea',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackOrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tracking...</div>}>
      <TrackOrder />
    </Suspense>
  );
}
