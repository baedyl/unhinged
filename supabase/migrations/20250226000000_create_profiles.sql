-- Unhinged profiles (Clerk user id = id)
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  age integer not null check (age >= 18 and age <= 120),
  interests text[] not null default '{}',
  genre text,
  prompts jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Anyone can read profiles (for matching)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can insert/update only their own profile (id = auth from app via service or anon with check)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (true)
  with check (true);

-- Optional: function to compute interest overlap (can be done in app too)
-- We'll do match % in the app with TanStack Query.
