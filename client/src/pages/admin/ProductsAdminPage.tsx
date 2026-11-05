import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../store/uiStore';

interface ProductData {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  taxPercent: number;
  stock: number;
  category: string;
  image: string;
  isActive: boolean;
}

export const ProductsAdminPage: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    taxPercent: '5',
    stock: '',
    category: '',
    image: '',
  });

  const { showToast } = useUIStore();

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?activeOnly=false');
      setProducts(res.data.data.products);
    } catch (err: any) {
      showToast('Failed to load products', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      price: '',
      taxPercent: '5',
      stock: '25',
      category: 'Pantry',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductData) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode,
      price: prod.price.toString(),
      taxPercent: prod.taxPercent.toString(),
      stock: prod.stock.toString(),
      category: prod.category,
      image: prod.image,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        price: parseFloat(formData.price),
        taxPercent: parseFloat(formData.taxPercent),
        stock: parseInt(formData.stock, 10),
        category: formData.category,
        image: formData.image,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deactivated', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast('Deactivation failed', 'error');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-neutral-800">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-900 dark:text-neutral-100">
            Store Catalog Management
          </h1>
          <p className="text-xs text-ink-500 dark:text-neutral-400">
            Add products, update prices, adjust inventory stock, and manage barcodes.
          </p>
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Add Product
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, barcode, or SKU..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-ink-900 dark:text-neutral-100 placeholder-ink-400 min-h-[40px] focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-stone-200/80 dark:border-neutral-700 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-neutral-900/50 border-b border-stone-200 dark:border-neutral-700 text-ink-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Tax %</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-700/60 font-sans">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-stone-50/50 dark:hover:bg-neutral-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 dark:border-neutral-700 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-ink-900 dark:text-neutral-100 block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-ink-500 font-mono">
                          {p.category} • {p.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-ink-700 dark:text-neutral-300">
                    {p.barcode}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold tabular-nums text-ink-900 dark:text-neutral-100">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="py-3 px-4 font-mono">{p.taxPercent}%</td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-semibold ${
                        p.stock < 10 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-500 dark:bg-neutral-700'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-ink-500 hover:text-brand-600 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-ink-500 hover:text-rose-600 rounded-lg"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-stone-200 dark:border-neutral-700 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-neutral-700 mb-4">
              <h3 className="font-serif text-xl font-medium text-ink-900 dark:text-neutral-100">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-ink-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  required
                />
                <Input
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Tax %"
                  type="number"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />

              <Input
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
