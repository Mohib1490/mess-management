import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Utilities from './pages/Utilities';
import FoodCost from './pages/FoodCost';
import CookSalary from './pages/CookSalary';
import MealSystem from './pages/MealSystem';
import MonthlyReport from './pages/MonthlyReport';
import MealMonthlyReport from './pages/MealMonthlyReport';
import FoodCostMonthlyReport from './pages/FoodCostMonthlyReport';
import Profile from './pages/Profile';
import UserGuideChat from './components/UserGuideChat';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin text-6xl mb-4">⚡</div>
      <p className="text-gray-600 text-lg font-medium">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, admin } = useAuth();
  const location = window.location;
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (admin?.role === 'member' && !['/', '/meal-system'].includes(location.pathname)) {
    return <Navigate to="/meal-system" replace />;
  }
  
  return children;
};

// Public Route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main Layout with Navbar
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <UserGuideChat />
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/members" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Members />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/utilities" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Utilities />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/food-cost" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <FoodCost />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/cook-salary" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <CookSalary />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/meal-system" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MealSystem />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/monthly-report" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MonthlyReport />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/meal-monthly-report" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MealMonthlyReport />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/food-cost-monthly-report" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <FoodCostMonthlyReport />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                style: {
                  background: '#10B981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#EF4444',
                },
              },
            }}
          />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;