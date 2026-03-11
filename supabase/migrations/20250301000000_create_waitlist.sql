create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null,
  hot_take text,
  vibe_check text not null,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "Anyone can insert waitlist" on public.waitlist
  for insert with check (true);

create policy "Anyone can read waitlist count" on public.waitlist
  for select using (true);
