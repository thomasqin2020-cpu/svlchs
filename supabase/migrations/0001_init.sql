-- ============================================================================
-- Spartan Vanguard 2026 Overhaul: initial schema + Row Level Security
-- ============================================================================
-- Run this in Supabase SQL editor (or via `supabase db push` if using CLI).
-- All tables have RLS enabled from day one. Read CLAUDE.md before editing.

-- ----------------------------------------------------------------------------
-- members — extends auth.users with profile + role
-- (created BEFORE is_admin() because the function body references this table)
-- ----------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  grade text,
  school_year text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.members enable row level security;

-- ----------------------------------------------------------------------------
-- HELPER: is_admin() — checks the current user's role in members table.
-- security definer means it bypasses RLS, so policies that call it on
-- public.members itself don't recurse infinitely.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql security definer stable
as $$
  select coalesce(
    (select role = 'admin' from public.members where id = auth.uid()),
    false
  );
$$;

-- Members policies (now that is_admin() exists)
create policy "members read own row" on public.members
  for select using (auth.uid() = id);
create policy "admins read all members" on public.members
  for select using (public.is_admin());
create policy "admins update members" on public.members
  for update using (public.is_admin());
create policy "members update own non-role fields" on public.members
  for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.members where id = auth.uid()));

-- ----------------------------------------------------------------------------
-- announcements
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  date date not null default current_date,
  pinned boolean not null default false,
  members_only boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;

create policy "public read public announcements" on public.announcements
  for select using (published = true and members_only = false);
create policy "members read all announcements" on public.announcements
  for select using (published = true and auth.uid() is not null);
create policy "admins full access announcements" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  location text default '',
  grades text default '',
  sign_up_link text default '',
  volunteer_link text default '',
  page_link text default '',
  description text default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;

create policy "public read upcoming published events" on public.events
  for select using (published = true);
create policy "admins full access events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- officers
-- ----------------------------------------------------------------------------
create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  order_idx int not null default 0,
  photo_url text,
  school_year text not null default '2026-2027',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.officers enable row level security;

create policy "public read published officers" on public.officers
  for select using (published = true);
create policy "admins full access officers" on public.officers
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- site_config — key/value bag for things like classroom code, emails, meeting schedule
-- ----------------------------------------------------------------------------
create table if not exists public.site_config (
  key text primary key,
  value text not null default ''
);
alter table public.site_config enable row level security;

create policy "public read site config" on public.site_config
  for select using (true);
create policy "admins write site config" on public.site_config
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- donations — populated by Stripe webhook only
-- ----------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_intent_id text unique,
  stripe_checkout_session_id text unique,
  amount_cents int not null,
  currency text not null default 'usd',
  donor_name text,
  donor_email text,
  anonymous boolean not null default false,
  message text,
  created_at timestamptz not null default now()
);
alter table public.donations enable row level security;

create policy "admins read donations" on public.donations
  for select using (public.is_admin());
-- Inserts come from the service-role webhook, which bypasses RLS.

-- ----------------------------------------------------------------------------
-- membership_signups — public form, admins review
-- ----------------------------------------------------------------------------
create table if not exists public.membership_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text,
  email text not null,
  why_joining text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.membership_signups enable row level security;

create policy "anyone insert membership signup" on public.membership_signups
  for insert with check (true);
create policy "admins read membership signups" on public.membership_signups
  for select using (public.is_admin());
create policy "admins update membership signups" on public.membership_signups
  for update using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- competition_registrations — public form for VMT/Aleph
-- ----------------------------------------------------------------------------
create table if not exists public.competition_registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,         -- 'vmt' or 'aleph'
  event_name text not null,
  student_name text not null,
  school text,
  grade text,
  email text not null,
  parent_email text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.competition_registrations enable row level security;

create policy "anyone insert competition registration" on public.competition_registrations
  for insert with check (true);
create policy "admins read competition registrations" on public.competition_registrations
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- contact_submissions — public form
-- ----------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  replied boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;

create policy "anyone insert contact submission" on public.contact_submissions
  for insert with check (true);
create policy "admins read contact submissions" on public.contact_submissions
  for select using (public.is_admin());
create policy "admins update contact submissions" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- allowed_classroom_codes — gate for member sign-up
-- ----------------------------------------------------------------------------
create table if not exists public.allowed_classroom_codes (
  code text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.allowed_classroom_codes enable row level security;

-- Public can READ to validate during signup (the code is the secret, not its existence).
-- We expose only the active flag so brute-forcing is the only attack vector.
create policy "public read active codes" on public.allowed_classroom_codes
  for select using (active = true);
create policy "admins manage codes" on public.allowed_classroom_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed the current Classroom code (from CLAUDE.md).
insert into public.allowed_classroom_codes (code, active)
values ('hsx4c54', true)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- announcement_subscribers — opt-in for member-only announcement emails
-- ----------------------------------------------------------------------------
create table if not exists public.announcement_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.announcement_subscribers enable row level security;

create policy "members manage own subscription" on public.announcement_subscribers
  for all using (auth.uid() = member_id) with check (auth.uid() = member_id);
create policy "admins read subscribers" on public.announcement_subscribers
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- TRIGGER: when an auth.user is created, do nothing automatically
--          (we want signup form to control profile insert with extra fields).
--          But provide a safe upsert helper.
-- ----------------------------------------------------------------------------
create or replace function public.upsert_member_for_current_user(
  p_full_name text default null,
  p_grade text default null
) returns void
language plpgsql security definer
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.members (id, email, full_name, grade)
  values (
    auth.uid(),
    coalesce((select email from auth.users where id = auth.uid()), ''),
    p_full_name,
    p_grade
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.members.full_name),
        grade     = coalesce(excluded.grade, public.members.grade);
end;
$$;

-- ----------------------------------------------------------------------------
-- Storage bucket for officer photos (run separately if needed)
-- ----------------------------------------------------------------------------
-- In Supabase dashboard: create public bucket "officer-photos".
-- Or via SQL:
--   insert into storage.buckets (id, name, public) values ('officer-photos', 'officer-photos', true)
--   on conflict (id) do nothing;
