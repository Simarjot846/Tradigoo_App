'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Upload, Camera, X, ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/components/inventory/product-form-dialog';

export function AddProductForm({ onProductAdded }: { onProductAdded: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    base_price: '',
    unit: 'kg',
    min_order_quantity: '10',
    description: '',
  });

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/products/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      setImageUrl(data.url);
      setPreviewUrl(data.url);
      toast.success('Product image uploaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Image upload failed');
      setPreviewUrl(imageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          base_price: parseFloat(formData.base_price),
          min_order_quantity: parseInt(formData.min_order_quantity, 10) || 1,
          image_url: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      setFormData({
        name: '',
        category: PRODUCT_CATEGORIES[0],
        base_price: '',
        unit: 'kg',
        min_order_quantity: '10',
        description: '',
      });
      setImageUrl(null);
      setPreviewUrl(null);
      onProductAdded();
      toast.success('Product added successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        List New Wholesale Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagePick} className="hidden" />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImagePick} className="hidden" />

        {previewUrl ? (
          <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 flex items-center gap-3">
            <img src={previewUrl} alt="Preview" referrerPolicy="no-referrer" className="w-16 h-16 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-200">
                {uploading ? 'Uploading photo...' : 'Product photo ready'}
              </p>
              <div className="flex gap-2 mt-1">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileRef.current?.click()}>
                  Replace
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs text-rose-600" onClick={() => { setImageUrl(null); setPreviewUrl(null); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 p-3.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
              <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Upload product photo (JPG, PNG, WebP · max 5 MB)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => fileRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> Gallery
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5 sm:hidden" onClick={() => cameraRef.current?.click()}>
                <Camera className="w-3.5 h-3.5" /> Camera
              </Button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Premium Basmati Rice"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Base Price (₹)</Label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>MOQ</Label>
            <Input
              type="number"
              min="1"
              value={formData.min_order_quantity}
              onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
              placeholder="10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe quality, packaging, origin, dispatch time..."
          />
        </div>

        <Button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {loading ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </form>
    </Card>
  );
}
