alter table public.listings
  add column if not exists is_public boolean default false,
  add column if not exists display_address text,
  add column if not exists category1 text,
  add column if not exists category2 text,
  add column if not exists deal_type text,
  add column if not exists sale_price text,
  add column if not exists deposit text,
  add column if not exists monthly_rent text,
  add column if not exists area_m2 numeric,
  add column if not exists area_py numeric,
  add column if not exists floor_info text,
  add column if not exists zoning text,
  add column if not exists detail_description text,
  add column if not exists stickers text[] default '{}',
  add column if not exists image_urls text[] default '{}';

create index if not exists listings_is_public_created_at_idx
  on public.listings (is_public, created_at desc);

-- If row level security is enabled later, public homepage reads need a policy like:
-- create policy "Public can read public listings"
--   on public.listings
--   for select
--   to anon
--   using (is_public = true);
--
-- Static GitHub Pages cannot securely perform privileged writes with only an anon key.
-- For admin insert/update/delete, prefer Supabase Auth policies or keep RLS disabled
-- until a secure admin auth flow is added.
