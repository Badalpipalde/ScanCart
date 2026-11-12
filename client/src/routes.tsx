import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy-loaded route components for route-level code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('./pages/customer/HomePage').then((m) => ({ default: m.HomePage })));
const ScannerPage = lazy(() => import('./pages/customer/ScannerPage').then((m) => ({ default: m.ScannerPage })));
const CartPage = lazy(() => import('./pages/customer/CartPage').then((m) => ({ default: m.CartPage })));
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const ReceiptPage = lazy(() => import('./pages/customer/ReceiptPage').then((m) => ({ default: m.ReceiptPage })));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ExitVerificationPage = lazy(() =>
  import('./pages/staff/ExitVerificationPage').then((m) => ({ default: m.ExitVerificationPage }))
);
const ProductsAdminPage = lazy(() =>
  import('./pages/admin/ProductsAdminPage').then((m) => ({ default: m.ProductsAdminPage }))
);

// Fallback loader while lazy chunk is being fetched
export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
    <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-ink-400 dark:text-neutral-500 font-mono">Loading view...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};
