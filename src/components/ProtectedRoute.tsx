import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'client' | 'freelancer' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  userType 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user.userType !== userType) {
    const redirectPath = user.userType === 'client' 
      ? '/client-dashboard' 
      : user.userType === 'freelancer'
      ? '/freelancer-dashboard'
      : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};