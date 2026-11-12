import { Suspense } from 'react';
import Login from '@/views/Login';

export const metadata = {
  title: 'Sign In | Yellow Tea',
  description: 'Log in to your Yellow Tea account to manage orders and track shipments.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign in...</div>}>
      <Login />
    </Suspense>
  );
}
