import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
          Order Receipts
        </h1>
        <p className="text-xs text-ink-500 dark:text-neutral-400">
          Review previous receipts and retrieve your digital exit passes.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-3xl border border-stone-200/80 dark:border-neutral-700 p-8">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-neutral-700/40 flex items-center justify-center text-ink-400 mx-auto mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-ink-900 dark:text-neutral-100">
            No receipts yet
          </h3>
          <p className="text-xs text-ink-500 dark:text-neutral-400 max-w-xs mx-auto mt-1 mb-5">
            When you complete self-checkout, your cryptographically signed QR receipt will appear here.
          </p>
          <Link to="/">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => {
            const isVerified = ord.exitStatus === 'verified';
            const totalQty = ord.items.reduce((acc: number, it: any) => acc + it.qty, 0);

            return (
              <Link
                key={ord._id}
                to={`/orders/${ord._id}/receipt`}
                className="group block p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle hover:border-brand-500 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink-900 dark:text-neutral-100">
                        #{ord._id.slice(-8).toUpperCase()}
                      </span>
                      {isVerified ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Exit Cleared
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Exit Gate
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-500 dark:text-neutral-400 mt-1">
                      {formatDate(ord.createdAt)} • {totalQty} {totalQty === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-ink-900 dark:text-neutral-100 font-mono tabular-nums">
                      {formatCurrency(ord.total)}
                    </span>
                    <span className="flex items-center justify-end text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:translate-x-0.5 transition-transform mt-0.5">
                      View QR Pass <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
