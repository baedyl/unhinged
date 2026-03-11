-- Add neighbourhood column; make legacy status nullable
alter table public.waitlist alter column status drop not null;
alter table public.waitlist add column if not exists neighbourhood text;
