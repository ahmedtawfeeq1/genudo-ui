
import React from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute
 * Static mode: always renders children within ErrorBoundary.
 * Replace with auth gating when integrating a real backend.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ProtectedRoute;
