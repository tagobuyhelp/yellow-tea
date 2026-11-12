'use client';

import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminRootLayout({ children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

