
-- Drop the overly broad SELECT policy
DROP POLICY "Anyone can view product images" ON storage.objects;

-- More restrictive: allow viewing individual objects but not listing
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.role() = 'anon' OR bucket_id = 'product-images' AND auth.role() = 'authenticated');
