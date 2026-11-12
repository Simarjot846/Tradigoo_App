-- Check existing RLS policies on products table
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
