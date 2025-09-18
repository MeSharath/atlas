import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics';

// Layout Components
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Page Components
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import CreateItineraryPage from '@/pages/CreateItineraryPage';
import ItineraryPage from '@/pages/ItineraryPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialize analytics
    analyticsService.initializeSession();

    // Track app load
    analyticsService.trackEvent('app_loaded', {
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });

    // Track page views on route changes
    const handleRouteChange = () => {
      analyticsService.trackPageView(window.location.pathname);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Track user authentication state changes
  useEffect(() => {
    if (user) {
      analyticsService.trackEvent('user_session_active', {
        userId: user.uid,
        userType: 'authenticated'
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading SoloAI...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <HomePage />
              </Layout>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <SignUpPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateItineraryPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/itinerary/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ItineraryPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
