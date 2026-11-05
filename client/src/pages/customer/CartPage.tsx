import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ScanLine, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../lib/api';
import { CartItemRow } from '../../components/cart/CartItemRow';
import { CartOrderSummary } from '../../components/cart/CartOrderSummary';
import { Button } from '../../components/common/Button';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, subtotal, tax, total, itemCount, fetchCart, updateQty, removeItem, clearCart, isLoading } =
    useCartStore();
  const { showToast } = useUIStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);

    try {
      // 1. Create gateway order on backend (recalculates zero-trust totals from DB)
      const res = await api.post('/payments/create-order');
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

      // 2. Check if running with mock gateway keys or without external SDK
      const RazorpayClass = (window as any).Razorpay;
      const isMockGateway = keyId.includes('mock') || !RazorpayClass;

      if (isMockGateway) {
        showToast('Processing test payment (Mock Gateway)...', 'info');
        await new Promise((resolve) => setTimeout(resolve, 800));
        await handleVerifyPayment(
          razorpayOrderId,
          `pay_mock_${Date.now()}`,
          'mock_valid_signature'
        );
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'ScanCart Retail',
        description: `Self-Checkout Order (${itemCount} items)`,
        image: '/favicon.svg',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          await handleVerifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@scancart.store',
        },
        theme: {
          color: '#1F6F54',
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
            showToast('Payment was cancelled.', 'info');
          },
        },
      };

      const rzpInstance = new RazorpayClass(options);

      rzpInstance.on('payment.failed', (failResp: any) => {
        setIsCheckingOut(false);
        showToast(
          `Payment failed: ${failResp.error.description || 'Transaction declined'}`,
          'error'
        );
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsCheckingOut(false);
      showToast(err.response?.data?.message || err.message || 'Checkout initiation failed', 'error');
    }
  };

  const handleVerifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    try {
      const verifyRes = await api.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      const { order } = verifyRes.data.data;
      showToast('Payment verified! Your exit receipt is ready.', 'success');
      navigate(`/orders/${order._id || order.id}/receipt`);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || 'Payment verification failed on server.',
        'error'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Empty Cart State
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-stone-200/80 dark:border-neutral-700/80 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-neutral-700/50 flex items-center justify-center text-ink-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-neutral-100">
          Your cart is empty
        </h2>
        <p className="mt-1 text-xs text-ink-500 dark:text-neutral-400 max-w-xs mb-6">
          Scan barcodes on items in the aisles to add them directly to your bag.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/scan')}
          leftIcon={<ScanLine className="w-5 h-5" />}
        >
          Start Scanning
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-neutral-800">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
            Shopping Cart
          </h1>
          <p className="text-xs text-ink-500 dark:text-neutral-400 font-mono">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/scan')}
            leftIcon={<ScanLine className="w-4 h-4" />}
          >
            Scan More
          </Button>
          <button
            onClick={clearCart}
            className="p-2 text-ink-400 hover:text-rose-600 rounded-xl transition-colors"
            title="Empty Cart"
            aria-label="Empty Cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQty={updateQty}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Order Summary & Pay Action */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <CartOrderSummary
              subtotal={subtotal}
              tax={tax}
              total={total}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={isCheckingOut}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
