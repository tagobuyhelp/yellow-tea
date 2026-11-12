import React from "react";
import { Navigate } from '@/lib/router-compat';
import { useAuth } from "@/contexts/AuthContext";
const AdminProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>);
    }
    // Check if user is authenticated and is an admin
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    if (user.role !== 'admin') {
        return <Navigate to="/" replace/>;
    }
    return <>{children}</>;
};
export default AdminProtectedRoute;
