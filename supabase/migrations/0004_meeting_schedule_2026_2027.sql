-- ============================================================================
-- 2026-2027 meeting schedule.
--
-- 0002_seed.sql inserts these keys with `on conflict (key) do nothing`, so it
-- only ever seeds a fresh database. An existing database still carries the
-- 2025-2026 values, so update them explicitly here.
--
--   Grades 7-8   -> Tuesdays,  Room 725
--   Grades 9-12  -> Thursdays, Room 315
--
-- Format is `audience | day, time | room`; the public site splits on `|`.
-- ============================================================================

insert into public.site_config (key, value) values
  ('meeting_1', 'Grades 9–12 | Thursday, 3:30–4:30 PM | Room 315'),
  ('meeting_2', 'Grades 7–8 | Tuesday, 3:30–4:30 PM | Room 725')
on conflict (key) do update set value = excluded.value;
