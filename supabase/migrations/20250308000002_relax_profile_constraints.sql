-- Allow profiles to be created with just clerk_id during onboarding
-- (name and age are collected in step 1, not at creation time)
ALTER TABLE profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN age DROP NOT NULL;
