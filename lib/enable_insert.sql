-- Enable INSERT access for authenticated users (Wholesalers)
CREATE POLICY "Enable insert for authenticated users" ON "public"."products"
FOR INSERT TO authenticated
WITH CHECK (true);

-- Enable UPDATE access for owners (optional, checking if user owns the product)
-- Assuming valid_supplier_id links to auth.uid() or similar, strictly simple for now:
CREATE POLICY "Enable update for authenticated users" ON "public"."products"
FOR UPDATE TO authenticated
USING (true);

-- Ensure storage bucket 'product-images' exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to product-images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
