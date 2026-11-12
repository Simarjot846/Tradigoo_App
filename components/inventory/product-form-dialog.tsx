'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, Camera, X, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export const PRODUCT_CATEGORIES = [
  'Grains & Pulses',
  'Spices & Condiments',
  'Edible Oils',
  'Beverages & Tea',
  'FMCG & Packaged',
  'Dry Fruits',
  'Textiles & Apparel',
  'Electronics & Accessories',
  'Health & Personal Care',
  'General',
];

export const PRODUCT_UNITS = ['kg', 'quintal', 'litre', 'piece', 'box', 'carton', 'pack', 'dozen'];

export interface EditableProduct {
  id: string;
  name: string;
  category: string;
  base_price: number;
  min_order_quantity: number;
  unit: string;
  description?: string | null;
  image_url?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  is_active?: boolean;
}

interface ProductFormDialogProps {
  children?: React.ReactNode;
  product?: EditableProduct | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export function ProductFormDialog({
  children,
  product,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: ProductFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    if (controlledOpen === undefined) setInternalOpen(val);
  };

  const isEdit = Boolean(product?.id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [basePrice, setBasePrice] = useState('');
  const [moq, setMoq] = useState('10');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setName(product.name || '');
      setCategory(product.category || PRODUCT_CATEGORIES[0]);
      setBasePrice(String(product.base_price ?? ''));
      setMoq(String(product.min_order_quantity ?? 1));
      setUnit(product.unit || 'kg');
      setDescription(product.description || '');
      setBatchNumber(product.batch_number || '');
      setExpiryDate(product.expiry_date ? String(product.expiry_date).slice(0, 10) : '');
      setIsActive(product.is_active !== false);
      setImageUrl(product.image_url || null);
      setPreviewUrl(product.image_url || null);
    } else {
      setName('');
      setCategory(PRODUCT_CATEGORIES[0]);
      setBasePrice('');
      setMoq('10');
      setUnit('kg');
      setDescription('');
      setBatchNumber('');
      setExpiryDate('');
      setIsActive(true);
      setImageUrl(null);
      setPreviewUrl(null);
    }
    setUploadError(null);
  }, [open, product]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
      const msg = 'Unsupported format. Please select a JPG, PNG, WebP, or GIF image.';
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = 'File exceeds 5 MB limit. Please pick a smaller image.';
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    const localObjectUrl = URL.createObjectURL(file);
    setPreviewUrl(localObjectUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/products/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || 'Image upload failed');
      }

      setImageUrl(payload.url);
      setPreviewUrl(payload.url);
      toast.success('Product image uploaded.');
    } catch (err: any) {
      const msg = err?.message || 'Could not upload image. Please retry.';
      setUploadError(msg);
      setPreviewUrl(imageUrl);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadingImage) {
      toast.info('Please wait for image upload to finish.');
      return;
    }

    const parsedPrice = Number(basePrice);
    const parsedMoq = Math.floor(Number(moq));

    if (!name.trim()) {
      toast.error('Please enter a product name.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Please enter a valid price greater than ₹0.');
      return;
    }
    if (isNaN(parsedMoq) || parsedMoq < 1) {
      toast.error('Minimum order quantity must be at least 1.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = isEdit ? `/api/products/${product!.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim() || 'General',
          base_price: parsedPrice,
          min_order_quantity: parsedMoq,
          unit: unit.trim() || 'unit',
          description: description.trim(),
          image_url: imageUrl,
          batch_number: batchNumber.trim() || null,
          expiry_date: expiryDate || null,
          is_active: isActive,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to save product');
      }

      toast.success(isEdit ? 'Product updated successfully.' : 'Product listed in marketplace.');
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? 'Edit Product Listing' : 'Add New Wholesale Product'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            Upload a clear product photo and specify B2B pricing and minimum order quantity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Image Upload & Preview Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Product Image
            </label>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 overflow-hidden">
                <div className="aspect-[16/9] w-full relative flex items-center justify-center bg-slate-100 dark:bg-zinc-900">
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain max-h-48"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center gap-2 text-white">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-medium">Uploading to secure storage...</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Image ready'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/50 p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-zinc-200 mb-1">
                  Upload product photo (JPG, PNG, WebP · max 5 MB)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3">
                  Clear photos improve retailer conversion on Tradigoo Marketplace.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 sm:hidden"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {uploadError}
              </p>
            )}
          </div>

          {/* Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Product Name *
              </label>
              <Input
                placeholder="e.g. Organic Basmati Rice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Category *
              </label>
              <select
                value={PRODUCT_CATEGORIES.includes(category) ? category : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') setCategory(e.target.value);
                }}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="250"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 tabular-nums"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                MOQ *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                className="h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 tabular-nums"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Unit *
              </label>
              <select
                value={PRODUCT_UNITS.includes(unit) ? unit : 'piece'}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Description & Wholesale Specs
            </label>
            <Textarea
              rows={2}
              placeholder="Grade, packaging size, dispatch lead time, shelf life..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Batch Number (optional)
              </label>
              <Input
                placeholder="e.g. BATCH-2026-A"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Expiry Date (optional)
              </label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm"
              />
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 px-3 py-2.5 cursor-pointer bg-slate-50 dark:bg-zinc-900/50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Listing active and visible in Retailer Marketplace
              </span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={saving || uploadingImage}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
