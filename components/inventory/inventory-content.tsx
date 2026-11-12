'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/ui/product-image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ProductFormDialog,
  EditableProduct,
  PRODUCT_CATEGORIES,
} from '@/components/inventory/product-form-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  RefreshCw,
  X,
} from 'lucide-react';

interface InventoryContentProps {
  initialProducts: any[];
}

export default function InventoryContent({ initialProducts }: InventoryContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const userId = user?.id;

  const fetchProducts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?sellerId=${encodeURIComponent(userId)}&includeInactive=true&limit=200`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || 'Could not refresh inventory');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId, fetchProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'All' && (p.category || '') !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'active' && p.is_active === false) return false;
      if (statusFilter === 'paused' && p.is_active !== false) return false;
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.batch_number || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const handleToggleActive = async (product: any) => {
    const nextActive = product.is_active === false;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update status');

      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, is_active: nextActive } : item))
      );
      toast.success(nextActive ? 'Listing activated in Marketplace.' : 'Listing paused.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update product status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete product');

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white mb-1 pl-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Manage B2B catalog listings, product photos, MOQ tiers, and visibility.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="h-10 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ProductFormDialog onSuccess={fetchProducts}>
              <Button className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs sm:text-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Product
              </Button>
            </ProductFormDialog>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, category, or batch number..."
              className="pl-10 pr-9 h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-slate-700 dark:text-zinc-200"
          >
            <option value="All">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            {(['all', 'active', 'paused'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`h-10 px-3 rounded-xl text-xs font-semibold capitalize whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-2xs">
          <Table className="min-w-[660px]">
            <TableHeader className="bg-slate-50 dark:bg-zinc-950/60">
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-zinc-800">
                <TableHead className="text-xs font-semibold pl-5">Product</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Visibility</TableHead>
                <TableHead className="text-xs font-semibold">Wholesale Price</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-sm text-slate-500">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-14">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {products.length === 0
                          ? 'No products listed yet'
                          : 'No products match your search or filters'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {products.length === 0
                          ? 'Click "Add Product" to upload photos and publish your first wholesale SKU.'
                          : 'Try clearing your search query or switching filters.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const isActive = product.is_active !== false;
                  return (
                    <TableRow
                      key={product.id}
                      className="border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                    >
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-3.5">
                          <ProductImage
                            src={product.image_url}
                            alt={product.name}
                            category={product.category}
                            aspect="square"
                            className="w-12 h-12 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[230px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums mt-0.5">
                              MOQ: {product.min_order_quantity} {product.unit || 'unit'}
                              {product.batch_number ? ` · Batch ${product.batch_number}` : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                        {product.category || 'General'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Paused'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                        ₹{Number(product.base_price || 0).toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500">
                          {' '}
                          / {product.unit || 'unit'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setEditDialogOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                                {isActive ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" /> Pause Listing
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" /> Activate Listing
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => setDeleteTarget(product)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <ProductFormDialog
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirmation Dialog (replaces browser confirm) */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product Listing?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400">
              This will permanently remove <strong className="text-slate-900 dark:text-white">{deleteTarget?.name}</strong> from your wholesale catalog. Existing orders referencing it will remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
