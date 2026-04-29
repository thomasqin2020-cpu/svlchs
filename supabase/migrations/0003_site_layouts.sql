-- ============================================================================
-- Site layout versioning: lets admins reorder/toggle homepage sections and
-- override their titles/intro copy. Drafts are private; publishing snapshots
-- the previous published row to status='archived' and promotes the draft.
-- ============================================================================

create table if not exists public.site_layouts (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  notes text,
  created_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

create index if not exists idx_site_layouts_status on public.site_layouts(status);
create index if not exists idx_site_layouts_created_at on public.site_layouts(created_at desc);

-- Only ONE row may have status='published' at any time.
create unique index if not exists uniq_site_layouts_one_published
  on public.site_layouts(status) where status = 'published';

alter table public.site_layouts enable row level security;

-- Anyone (anon + authenticated) can read the currently published layout
-- so the public homepage can render server-side.
drop policy if exists "anon read published layout" on public.site_layouts;
create policy "anon read published layout"
  on public.site_layouts for select
  to anon, authenticated
  using (status = 'published');

-- Admins can do everything: read drafts/archives, save drafts, publish.
drop policy if exists "admins manage layouts" on public.site_layouts;
create policy "admins manage layouts"
  on public.site_layouts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
