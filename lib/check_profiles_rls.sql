-- Check RLS policies for profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Enable read access for profiles if not exists
CREATE POLICY "Enable read access for authenticated users" ON "public"."profiles"
FOR SELECT TO authenticated
USING (true);
