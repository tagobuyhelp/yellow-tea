import { Suspense } from 'react';
import Profile from '@/views/Profile';

export const metadata = {
  title: 'My Profile | Yellow Tea',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading profile...</div>}>
      <Profile />
    </Suspense>
  );
}
