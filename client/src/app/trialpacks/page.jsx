import { Suspense } from 'react';
import TrialPacks from '@/views/TrialPacks';

export const metadata = {
  title: 'Tea Trial Packs & Samplers | Yellow Tea',
  description: 'Try sample and trial packs of authentic Assam, Darjeeling, and Masala Chai from Yellow Tea.',
  alternates: {
    canonical: 'https://yellowtea.in/trialpacks',
  },
};

export default function TrialPacksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading trial packs...</div>}>
      <TrialPacks />
    </Suspense>
  );
}
