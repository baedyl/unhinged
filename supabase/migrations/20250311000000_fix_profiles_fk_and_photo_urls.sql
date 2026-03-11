-- ─── Fix 1: Drop auth.users FK constraint (incompatible with Clerk-only auth) ──
-- The profiles.id column was referencing auth.users(id), which blocks inserts
-- because Clerk users are never in auth.users.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ─── Fix 2: Add photo_urls array column (app code expects text[]) ──────────────
-- The existing photo_url (singular text) column is kept for backward compat.
-- New onboarding flow uses photo_urls (text[]) to store multiple photos.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';
