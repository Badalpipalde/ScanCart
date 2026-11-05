import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { useUIStore } from './store/uiStore';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  const { checkAuth, user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { theme } = useUIStore();

  useEffect(() => {
    // Sync dark mode class on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Verify existing session
    checkAuth();
  }, [checkAuth, theme]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
