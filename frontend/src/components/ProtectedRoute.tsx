import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = typeof user.role === 'string' ? user.role : user.role.code;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to dashboard if unauthorized for specific route
    // or maybe a 403 page. For now, redirect to home/dashboard which everyone has access to (except Login)
    // But if dashboard itself is restricted, we need care.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
