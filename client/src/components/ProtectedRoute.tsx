import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  fallback,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Optionally, redirect to a forbidden page or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for protecting components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ProtectedRoute redirectTo={redirectTo}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for requiring authentication
export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      // Redirect to login with return location
      window.location.href = `${redirectTo}?returnTo=${encodeURIComponent(location.pathname)}`;
    }
  }, [user, loading, redirectTo, location.pathname]);

  return { user, loading };
};

// Hook for optional authentication (useful for features that work with or without auth)
export const useOptionalAuth = () => {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: !loading && !user,
  };
}; 