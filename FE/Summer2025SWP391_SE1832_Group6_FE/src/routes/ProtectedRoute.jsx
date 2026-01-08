import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context';
import { Spin } from 'antd';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authLoading, isAuthenticated } = useContext(AuthContext);
  
  console.log('ProtectedRoute - Auth state:', {
    authLoading,
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    hasRequiredRole: allowedRoles ? allowedRoles.includes(user?.role) : true
  });

  // Show loading state while auth state is being determined
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // If role-based access is required and user doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('ProtectedRoute - Access denied for role:', user?.role);
    return <Navigate to="/" replace />;
  }

  // If we get here, user is authenticated and has the required role
  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute;