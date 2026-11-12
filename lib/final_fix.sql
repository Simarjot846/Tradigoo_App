-- ROBUST IMAGE FIX (V5)
-- Uses "ILIKE" to match names even if there are spaces or case differences.
-- This WILL find the products and update them.

-- 1. Rice
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Rice%';

-- 2. Toor Dal
UPDATE products SET image_url = 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da7?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Toor Dal%';

-- 3. Sunflower Oil
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1474979266404-7eaacbcdcc3c?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Sunflower%';

-- 4. Atta
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Atta%' OR name ILIKE '%Wheat Flour%';

-- 5. Jaggery
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Jaggery%';

-- 6. Masoor Dal
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Masoor%';

-- 7. Tea
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Tea%';

-- 8. Chickpeas
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584269664287-975003c00827?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Chickpeas%' OR name ILIKE '%Kabuli%';

-- 9. Salt
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1626139576127-4520f92d4b7c?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Salt%';

-- 10. Turmeric
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1615485499978-500192746433?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Turmeric%';

-- 11. Mustard Oil
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574689049597-7e6db3cd2a73?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Mustard%';

-- 12. Moong Dal
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1543662527-3870af906354?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Moong%';

-- 13. Besan
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1605658667509-c186080537fd?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Besan%' OR name ILIKE '%Gram Flour%';

-- 14. Chilli
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606914502099-656dc086c071?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Chilli%' OR name ILIKE '%Chili%';

-- 15. Coriander
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Coriander%';

-- 16. Sugar
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1581026038221-395744cb48e6?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Sugar%';

-- 17. Urad Dal
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1626082927389-d4212739fb93?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Urad%';

-- 18. Cumin
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1507725914440-e1e434ce161d?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Cumin%' OR name ILIKE '%Jeera%';

-- 19. Groundnut
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1620706857370-11f42bb40b59?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Groundnut%';

-- 20. Sooji
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=1000&auto=format&fit=crop' 
WHERE name ILIKE '%Sooji%' OR name ILIKE '%Semolina%';

-- Verify
SELECT name, image_url FROM products;
