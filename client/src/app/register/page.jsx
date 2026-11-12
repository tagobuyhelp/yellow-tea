import { Suspense } from 'react';
import Register from '@/views/Register';

export const metadata = {
  title: 'Create an Account | Yellow Tea',
  description: 'Create a Yellow Tea account to explore artisanal whole leaf teas.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading registration...</div>}>
      <Register />
    </Suspense>
  );
}
