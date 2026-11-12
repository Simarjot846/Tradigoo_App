-- Add theme_preference column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark';

-- Add check constraint to ensure valid values
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS allowed_themes;

ALTER TABLE profiles 
ADD CONSTRAINT allowed_themes 
CHECK (theme_preference IN ('light', 'dark', 'system'));
