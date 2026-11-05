import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/customer/HomePage';
import { ScannerPage } from './pages/customer/ScannerPage';
import { CartPage } from './pages/customer/CartPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { ReceiptPage } from './pages/customer/ReceiptPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { ExitVerificationPage } from './pages/staff/ExitVerificationPage';
import { ProductsAdminPage } from './pages/admin/ProductsAdminPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="scan" element={<ScannerPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id/receipt" element={<ReceiptPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Staff Only: Exit Verification Gate */}
        <Route
          path="staff/exit-gate"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ExitVerificationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only: Catalog Management */}
        <Route
          path="admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProductsAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

