import { Suspense } from 'react';
import Gifts from '@/views/Gifts';

export const metadata = {
  title: 'Tea Gift Boxes & Hampers | Yellow Tea',
  description: 'Curated premium whole leaf tea gifts, sampler sets, and luxury boxes from Yellow Tea.',
  alternates: {
    canonical: 'https://yellowtea.in/gifts',
  },
};

export default function GiftsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading gifts...</div>}>
      <Gifts />
    </Suspense>
  );
}
