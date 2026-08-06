import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Grab the current authentication state from the global context
  const { currentUser, userProfile, loading } = useAuth();

  // 1. Wait for Firebase to finish determining the user's auth state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 2. Not logged in: Redirect unauthenticated users back to the login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Email Not Verified: Force users to verify their email before accessing the dashboard
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 4. Role-Based Access Control (RBAC):
  // Check if this route is restricted to specific roles, and if the current user has that role
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // If the user tries to access a page they don't have permission for, redirect them
    // to their specific role's home page (e.g. resident trying to access admin dashboard)
    switch (userProfile.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'guard':
        return <Navigate to="/guard" replace />;
      case 'resident':
      default:
        return <Navigate to="/resident" replace />;
    }
  }

  // 5. Success: User is authenticated, verified, and authorized. Render the child routes.
  return <Outlet />;
};
