import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { QRReceiptCard } from '../../components/receipt/QRReceiptCard';
import type { OrderReceiptData } from '../../components/receipt/QRReceiptCard';
import { Button } from '../../components/common/Button';

export const ReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        const ord = res.data.data.order;
        setOrder({
          id: ord._id,
          items: ord.items,
          subtotal: ord.subtotal,
          tax: ord.tax,
          total: ord.total,
          payment: ord.payment,
          receiptToken: ord.receiptToken,
          exitStatus: ord.exitStatus,
          createdAt: ord.createdAt,
          verifiedAt: ord.verifiedAt,
          verifiedBy: ord.verifiedBy,
        });

        // Trigger subtle confetti burst
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#1F6F54', '#54A98C', '#FAF8F5'],
          });
        } catch {}
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order receipt');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
        <p className="text-xs text-ink-500">Generating receipt pass...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-12 p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-stone-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-ink-900 dark:text-neutral-100">
          Receipt Not Found
        </h2>
        <p className="text-xs text-ink-500 mt-1 mb-6">{error || 'Could not locate this receipt.'}</p>
        <Link to="/orders">
          <Button variant="outline" size="sm">
            View My Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between max-w-md mx-auto print:hidden">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-neutral-400 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Receipts</span>
        </Link>
      </div>

      <QRReceiptCard order={order} />
    </div>
  );
};
