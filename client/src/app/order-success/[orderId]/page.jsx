import { Suspense } from 'react';
import OrderSuccess from '@/views/OrderSuccess';

export const metadata = {
  title: 'Order Details | Yellow Tea',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderSuccessDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading order...</div>}>
      <OrderSuccess />
    </Suspense>
  );
}
