-- ============================================================================
-- One-time seed: current site_config + 2025-2026 cabinet (so the site has
-- content right after `0001_init.sql`). Replace with the 2026-2027 cabinet
-- once Thomas pastes the list.
-- ============================================================================

-- Default site config (matches what was hardcoded in lib/data.ts fallback)
insert into public.site_config (key, value) values
  ('google_classroom', 'hsx4c54'),
  ('remind', '@lchssv'),
  ('email_1', 'vchen26@mylcusd.net'),
  ('email_2', 'nchen26@mylcusd.net'),
  ('meeting_1', 'Grades 9–10 | Monday, 3:30–5:00 PM | Room 217'),
  ('meeting_2', 'Grades 7–8 | Wednesday, 3:30–4:30 PM | Room 724'),
  ('announcement_text', 'Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Cañada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!')
on conflict (key) do nothing;

-- Outgoing 2025-2026 cabinet (kept for archive/alumni; published=false hides on the public site)
insert into public.officers (name, role, order_idx, school_year, published) values
  ('Victoria Chen',  'Co-President',                1, '2025-2026', false),
  ('Nathaniel Chen', 'Co-President',                2, '2025-2026', false),
  ('Leo Wang',       'Secretary',                   3, '2025-2026', false),
  ('Khunhoon Lee',   'Treasurer',                   4, '2025-2026', false),
  ('Dohhoon Lee',    'Competition & Web Manager',   5, '2025-2026', false),
  ('Max Tieu',       'Publicity Chair',             6, '2025-2026', false)
on conflict do nothing;

-- Incoming 2026-2027 cabinet (published=true → these show on the public site)
insert into public.officers (name, role, order_idx, school_year, published) values
  ('Dobhoon',  'President',       1, '2026-2027', true),
  ('Leo',      'Vice President',  2, '2026-2027', true),
  ('Khunhoon', 'Secretary',       3, '2026-2027', true),
  ('Anish',    'Treasurer',       4, '2026-2027', true),
  ('Thomas',   'Manager',         5, '2026-2027', true),
  ('Rebecca',  'Publicity',       6, '2026-2027', true)
on conflict do nothing;

-- Seed the two flagship events for 2025-2026 (still upcoming as of plan time)
insert into public.events (name, date, location, grades, sign_up_link, volunteer_link, page_link, description, published) values
  ('Vanguard Math Tournament', '2026-02-21', 'La Cañada High School', 'Grades 6–8',  '/competitions/vmt/register',   'https://forms.gle/EqUt4VN5SoBkuBF86', '/vmt',   'Annual middle-school tournament.', true),
  ('Aleph',                    '2026-03-21', 'La Cañada High School', 'Grades 9–12', '/competitions/aleph/register', 'https://forms.gle/NDthbirThVbnxmW37', '/aleph', 'High school math competition.',     true)
on conflict do nothing;
