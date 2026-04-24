-- Add email verification columns to the waitlist table
alter table public.waitlist
  add column if not exists verification_token uuid,
  add column if not exists verified_at timestamptz;

-- Unique constraint so tokens can't collide
create unique index if not exists waitlist_verification_token_idx
  on public.waitlist (verification_token)
  where verification_token is not null;

-- Allow the service role (Edge Function) to update verification_token and verified_at
-- RLS is already enabled; service role bypasses RLS by default, no extra policy needed.
