'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Search,
  ShieldCheck,
  X,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  PackageSearch,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MarketplaceLoading from '@/app/marketplace/loading';
import ProductCard from '@/components/marketplace/product-card';

interface MarketplaceContentProps {
  initialProducts: any[];
}

const DEFAULT_MAX_PRICE = 200000;

export default function MarketplaceContent({ initialProducts }: MarketplaceContentProps) {
  const { loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, DEFAULT_MAX_PRICE]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [moqFilter, setMoqFilter] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loadingProducts, setLoadingProducts] = useState(initialProducts.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) setCategoryFilter(categoryFromUrl);
    else setCategoryFilter('all');

    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl !== null) {
      setSearchQuery(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/products?limit=100', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load marketplace catalog.');
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Marketplace fetch error:', err);
      setFetchError(err?.message || 'Unable to load products right now. Please retry.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const maxCatalogPrice = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, Number(p.base_price || 0)), 0);
    return Math.max(DEFAULT_MAX_PRICE, Math.ceil(highest / 5000) * 5000);
  }, [products]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['all', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];

    return products
      .filter((p) => {
        if (terms.length > 0) {
          const haystack = [
            p.name,
            p.category,
            p.description,
            p.seller?.business_name,
            p.seller?.name,
            p.seller?.location,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!terms.every((t) => haystack.includes(t))) return false;
        }

        if (categoryFilter !== 'all' && (p.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        const price = Number(p.base_price || 0);
        if (price < priceRange[0] || price > priceRange[1]) return false;

        if (verifiedOnly && !p.seller?.gst_verified) return false;

        const moq = Number(p.min_order_quantity || 1);
        if (moqFilter === 'low' && moq >= 50) return false;
        if (moqFilter === 'medium' && (moq < 50 || moq > 200)) return false;
        if (moqFilter === 'high' && moq <= 200) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.base_price || 0) - Number(b.base_price || 0);
        if (sortBy === 'price-high') return Number(b.base_price || 0) - Number(a.base_price || 0);
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'moq-low') return Number(a.min_order_quantity || 1) - Number(b.min_order_quantity || 1);
        return Number(b.demand_score || 0) - Number(a.demand_score || 0);
      });
  }, [products, searchQuery, categoryFilter, priceRange, verifiedOnly, moqFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : '/marketplace', { scroll: false });
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setPriceRange([0, maxCatalogPrice]);
    setMoqFilter(null);
    setVerifiedOnly(false);
    setSortBy('relevance');
    router.replace('/marketplace', { scroll: false });
  };

  if (authLoading && products.length === 0) {
    return <MarketplaceLoading />;
  }

  const FilterControls = () => (
    <div className="space-y-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
      <div>
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2.5">Categories</h3>
        <div className="flex flex-col gap-1 text-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setIsMobileFilterOpen(false);
              }}
              className={`text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-blue-50 dark:bg-blue-500/10 font-semibold text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Price Range (₹)</h3>
        <Slider
          min={0}
          max={maxCatalogPrice}
          step={500}
          value={priceRange}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          className="my-4"
        />
        <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2.5">Minimum Order Qty</h3>
        <div className="flex flex-col gap-2">
          {[
            { id: 'low', label: 'Under 50 units' },
            { id: 'medium', label: '50 – 200 units' },
            { id: 'high', label: 'Above 200 units' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-zinc-400 cursor-pointer">
              <Checkbox
                checked={moqFilter === opt.id}
                onCheckedChange={(c) => setMoqFilter(c ? opt.id : null)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2.5">Supplier Verification</h3>
        <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-zinc-300 cursor-pointer">
          <Checkbox
            checked={verifiedOnly}
            onCheckedChange={(c) => setVerifiedOnly(Boolean(c))}
          />
          <span className="flex items-center gap-1.5">
            GST Verified Only
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </span>
        </label>
      </div>

      <Button type="button" variant="outline" onClick={resetFilters} className="w-full text-xs">
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Prominent Marketplace Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 overflow-hidden"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, category, supplier, or keywords..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-full text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Button
                type="submit"
                className="h-full rounded-none px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
              >
                Search
              </Button>
            </form>

            <div className="flex items-center justify-between md:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden h-10 gap-1.5 text-xs font-semibold"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[175px] h-10 text-xs sm:text-sm bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="moq-low">Lowest MOQ</SelectItem>
                  <SelectItem value="newest">Newest Listings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Category Strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => {
              const active = categoryFilter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-blue-400'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap pl-2 tabular-nums">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        <aside className="w-64 shrink-0 hidden md:block">
          <FilterControls />
        </aside>

        <div className="flex-1 min-w-0">
          {fetchError ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-zinc-900 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Could not load marketplace catalog
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-5">{fetchError}</p>
              <Button onClick={fetchProducts} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <RefreshCw className="w-4 h-4" /> Retry Loading
              </Button>
            </div>
          ) : loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3"
                >
                  <div className="aspect-[4/3] w-full rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-8 w-full rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No matching wholesale products
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
                {searchQuery
                  ? `No listings matched "${searchQuery}". Try broadening your keywords or clearing active filters.`
                  : 'No active listings matched the selected price or category filters.'}
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Search &amp; Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-[330px] bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 p-5 flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <span className="font-bold text-base">Filter Catalog</span>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <FilterControls />
            </div>
            <Button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full mt-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Show {filteredProducts.length} Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
