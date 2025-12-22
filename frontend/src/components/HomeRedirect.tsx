import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Dashboard from '../pages/Dashboard';

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = typeof user.role === 'string' ? user.role : user.role.code;

  switch (userRole) {
    case 'STORE_MANAGER':
      return <Dashboard />;
    case 'INVENTORY_STAFF':
      return <Navigate to="/inventory" replace />;
    case 'PROCUREMENT_STAFF':
      return <Navigate to="/procurement" replace />;
    case 'ADMIN':
      return <Navigate to="/users" replace />;
    default:
      return <div>Access Denied</div>;
  }
};

export default HomeRedirect;
