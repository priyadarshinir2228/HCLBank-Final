import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import KycPage from './pages/KycPage';
import CustomerDashboard from './pages/CustomerDashboard';
import SendMoney from './pages/SendMoney';
import AddMoney from './pages/AddMoney';
import TransactionsHistory from './pages/TransactionsHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

const RootRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (!user.kycCompleted) return <Navigate to="/kyc" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Customer Routes */}
          <Route path="/kyc" element={
            <ProtectedRoute role="CUSTOMER">
              <KycPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute role="CUSTOMER">
              <DashboardLayout role="CUSTOMER">
                <CustomerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/send-money" element={
            <ProtectedRoute role="CUSTOMER">
              <DashboardLayout role="CUSTOMER">
                <SendMoney />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/add-money" element={
            <ProtectedRoute role="CUSTOMER">
              <DashboardLayout role="CUSTOMER">
                <AddMoney />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute role="CUSTOMER">
              <DashboardLayout role="CUSTOMER">
                <TransactionsHistory />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute role="CUSTOMER">
              <DashboardLayout role="CUSTOMER">
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
