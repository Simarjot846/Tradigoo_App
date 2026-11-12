-- MANUAL UPDATE SCRIPT (Local Files)
-- This script sets your products to look for images in your "public/products" folder.
-- You must save the images with these EXACT filenames.

-- 1. Rice -> /products/rice.jpg
UPDATE products SET image_url = '/products/rice.jpg' WHERE name ILIKE '%Rice%';

-- 2. Toor Dal -> /products/toor-dal.jpg
UPDATE products SET image_url = '/products/toor-dal.jpg' WHERE name ILIKE '%Toor Dal%';

-- 3. Sunflower Oil -> /products/sunflower-oil.jpg
UPDATE products SET image_url = '/products/sunflower-oil.jpg' WHERE name ILIKE '%Sunflower%';

-- 4. Atta -> /products/atta.jpg
UPDATE products SET image_url = '/products/atta.jpg' WHERE name ILIKE '%Atta%';

-- 5. Jaggery -> /products/jaggery.jpg
UPDATE products SET image_url = '/products/jaggery.jpg' WHERE name ILIKE '%Jaggery%';

-- 6. Masoor Dal -> /products/masoor-dal.jpg
UPDATE products SET image_url = '/products/masoor-dal.jpg' WHERE name ILIKE '%Masoor%';

-- 7. Tea -> /products/tea.jpg
UPDATE products SET image_url = '/products/tea.jpg' WHERE name ILIKE '%Tea%';

-- 8. Chickpeas -> /products/chickpeas.jpg
UPDATE products SET image_url = '/products/chickpeas.jpg' WHERE name ILIKE '%Chickpeas%';

-- 9. Salt -> /products/salt.jpg
UPDATE products SET image_url = '/products/salt.jpg' WHERE name ILIKE '%Salt%';

-- 10. Turmeric -> /products/turmeric.jpg
UPDATE products SET image_url = '/products/turmeric.jpg' WHERE name ILIKE '%Turmeric%';

-- 11. Mustard Oil -> /products/mustard-oil.jpg
UPDATE products SET image_url = '/products/mustard-oil.jpg' WHERE name ILIKE '%Mustard%';

-- 12. Moong Dal -> /products/moong-dal.jpg
UPDATE products SET image_url = '/products/moong-dal.jpg' WHERE name ILIKE '%Moong%';

-- 13. Besan -> /products/besan.jpg
UPDATE products SET image_url = '/products/besan.jpg' WHERE name ILIKE '%Besan%';

-- 14. Chilli -> /products/chilli.jpg
UPDATE products SET image_url = '/products/chilli.jpg' WHERE name ILIKE '%Chilli%';

-- 15. Coriander -> /products/coriander.jpg
UPDATE products SET image_url = '/products/coriander.jpg' WHERE name ILIKE '%Coriander%';

-- 16. Sugar -> /products/sugar.jpg
UPDATE products SET image_url = '/products/sugar.jpg' WHERE name ILIKE '%Sugar%';

-- 17. Urad Dal -> /products/urad-dal.jpg
UPDATE products SET image_url = '/products/urad-dal.jpg' WHERE name ILIKE '%Urad%';

-- 18. Cumin -> /products/cumin.jpg
UPDATE products SET image_url = '/products/cumin.jpg' WHERE name ILIKE '%Cumin%';

-- 19. Groundnut Oil -> /products/groundnut-oil.jpg
UPDATE products SET image_url = '/products/groundnut-oil.jpg' WHERE name ILIKE '%Groundnut%';

-- 20. Sooji -> /products/sooji.jpg
UPDATE products SET image_url = '/products/sooji.jpg' WHERE name ILIKE '%Sooji%';

-- Verify
SELECT name, image_url FROM products;
