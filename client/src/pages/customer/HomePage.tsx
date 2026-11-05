import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, ShoppingBag, ShieldCheck, Search, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatters';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

interface ProductItem {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  taxPercent: number;
  stock: number;
  image: string;
  category: string;
}

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [latestOrder, setLatestOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products');
        const prods: ProductItem[] = res.data.data.products;
        setProducts(prods);

        const cats = Array.from(new Set(prods.map((p) => p.category)));
        setCategories(['All', ...cats]);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestOrder = async () => {
      if (!user) return;
      try {
        const res = await api.get('/orders');
        const orders = res.data.data.orders;
        if (orders.length > 0) {
          setLatestOrder(orders[0]);
        }
      } catch {}
    };

    fetchCatalog();
    fetchLatestOrder();
  }, [user]);

  const handleQuickAdd = async (product: ProductItem) => {
    try {
      await addItem(product._id, 1);
      showToast(`Added ${product.name} to cart`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery.trim()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Action Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-stone-200/80 dark:border-neutral-700/80 shadow-card">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-brand-200/60 dark:border-brand-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store #104 Express Checkout</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
            Scan as you shop, pay in seconds.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-600 dark:text-neutral-400 leading-relaxed">
            Point your phone camera at any barcode in the aisle. Watch your total update live, tap to pay with UPI/Card, and show your exit pass at the gate.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              className="text-sm font-semibold shadow-md"
              leftIcon={<ScanLine className="w-5 h-5" />}
              onClick={() => navigate('/scan')}
            >
              Open Camera Scanner
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/cart')}
              leftIcon={<ShoppingBag className="w-5 h-5" />}
            >
              View Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Active Exit Pass Reminder (If customer has an unverified order) */}
      {latestOrder && latestOrder.exitStatus === 'pending' && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                Active Exit Pass Available
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Order #{latestOrder._id.slice(-6).toUpperCase()} is paid and awaiting guard verification.
              </p>
            </div>
          </div>
          <Link
            to={`/orders/${latestOrder._id}/receipt`}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 underline hover:text-emerald-950 shrink-0 ml-2"
          >
            Show Pass &rarr;
          </Link>
        </div>
      )}

      {/* Product Catalog & Search Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-ink-900 dark:text-neutral-100">
              In-Store Catalog
            </h2>
            <p className="text-xs text-ink-500 dark:text-neutral-400">
              Available for immediate shelf pickup ({products.length} products)
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-ink-900 dark:text-neutral-100 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[40px]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-ink-700 dark:text-neutral-300 border border-stone-200 dark:border-neutral-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-800 p-3 rounded-2xl border border-stone-200/80 space-y-2"
              >
                <Skeleton className="w-full aspect-square" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-stone-200/80 dark:border-neutral-700 p-8">
            <p className="text-sm text-ink-500 dark:text-neutral-400">
              No products found matching "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod._id}
                className="group flex flex-col justify-between bg-white dark:bg-neutral-800 rounded-2xl p-3 border border-stone-200/80 dark:border-neutral-700/80 shadow-subtle hover:shadow-card transition-all"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-50 mb-2.5">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {prod.barcode.slice(-5)}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-mono text-ink-500 dark:text-neutral-400">
                    {prod.category}
                  </span>
                  <h3 className="text-xs font-semibold text-ink-900 dark:text-neutral-100 line-clamp-2 mt-0.5">
                    {prod.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 dark:border-neutral-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-ink-900 dark:text-neutral-100 font-mono tabular-nums">
                      {formatCurrency(prod.price)}
                    </span>
                    <span className="block text-[9px] text-ink-500">
                      {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(prod)}
                    disabled={prod.stock <= 0}
                    className="p-2 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-700 hover:text-white dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
                    title="Add to Cart"
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
