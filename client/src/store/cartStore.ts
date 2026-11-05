import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  taxPercent: number;
  stock: number;
  image: string;
  category: string;
}

export interface CartItem {
  product: CartProduct;
  qty: number;
  itemSubtotal: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  recentlyScannedItem: CartProduct | null;
  setRecentlyScannedItem: (item: CartProduct | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, qty?: number) => Promise<CartProduct>;
  scanAndAddBarcode: (barcode: string) => Promise<CartProduct>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  recentlyScannedItem: null,

  setRecentlyScannedItem: (item) => set({ recentlyScannedItem: item }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/cart');
      const cart = res.data.data.cart;
      set({
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to sync cart',
      });
    }
  },

  addItem: async (productId: string, qty = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/cart/items', { productId, qty });
      const cart = res.data.data.cart;
      set({
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
      });

      const added = cart.items.find((it: CartItem) => it.product.id === productId);
      return added ? added.product : null;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not add item to cart';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  scanAndAddBarcode: async (barcode: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Look up barcode
      const productRes = await api.get(`/products/barcode/${encodeURIComponent(barcode)}`);
      const product = productRes.data.data.product;

      if (!product) {
        throw new Error('Product not found for this barcode');
      }

      // 2. Add to cart
      const cartRes = await api.post('/cart/items', { productId: product._id, qty: 1 });
      const cart = cartRes.data.data.cart;

      set({
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
        recentlyScannedItem: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          price: product.price,
          taxPercent: product.taxPercent,
          stock: product.stock,
          image: product.image,
          category: product.category,
        },
      });

      // 3. Audio/Haptic feedback (graceful degradation)
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([40, 30, 40]);
        }
      } catch {}

      return product;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Scanning lookup failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  updateQty: async (productId: string, qty: number) => {
    try {
      const res = await api.patch(`/cart/items/${productId}`, { qty });
      const cart = res.data.data.cart;
      set({
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not update item quantity';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  removeItem: async (productId: string) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      const cart = res.data.data.cart;
      set({
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        tax: cart.tax || 0,
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not remove item';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      });
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  },
}));
