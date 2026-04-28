import { createSupabaseServerClient } from './supabase/server'
import type { Announcement, Event, Officer, SiteConfig } from '@/types/content'

// ----------------------------------------------------------------------------
// Hardcoded fallback data — used when Supabase env isn't set OR query errors.
// Once Supabase is provisioned + seeded, these are mostly irrelevant.
// ----------------------------------------------------------------------------

const fallbackEvents: Event[] = [
  {
    id: 'vmt-fallback',
    name: 'Vanguard Math Tournament',
    date: 'February 21, 2026',
    location: 'La Cañada High School',
    grades: 'Grades 6–8',
    signUpLink: '/competitions/vmt/register',
    volunteerLink: 'https://forms.gle/EqUt4VN5SoBkuBF86',
    pageLink: '/vmt',
    description: 'Annual tournament for grades 6–8.',
  },
  {
    id: 'aleph-fallback',
    name: 'Aleph',
    date: 'March 21, 2026',
    location: 'La Cañada High School',
    grades: 'Grades 9–12',
    signUpLink: '/competitions/aleph/register',
    volunteerLink: 'https://forms.gle/NDthbirThVbnxmW37',
    pageLink: '/aleph',
    description: 'High school math competition for grades 9–12.',
  },
]

// 2026-2027 cabinet (current). Last names + photos can be filled in via /admin/officers.
const fallbackOfficers: Officer[] = [
  { id: '1', name: 'Dobhoon',  role: 'President',      order: 1, photoUrl: null, schoolYear: '2026-2027' },
  { id: '2', name: 'Leo',      role: 'Vice President', order: 2, photoUrl: null, schoolYear: '2026-2027' },
  { id: '3', name: 'Khunhoon', role: 'Secretary',      order: 3, photoUrl: null, schoolYear: '2026-2027' },
  { id: '4', name: 'Anish',    role: 'Treasurer',      order: 4, photoUrl: null, schoolYear: '2026-2027' },
  { id: '5', name: 'Thomas',   role: 'Manager',        order: 5, photoUrl: null, schoolYear: '2026-2027' },
  { id: '6', name: 'Rebecca',  role: 'Publicity',      order: 6, photoUrl: null, schoolYear: '2026-2027' },
]

const fallbackConfig: SiteConfig = {
  google_classroom: 'hsx4c54',
  remind: '@lchssv',
  email_1: 'vchen26@mylcusd.net',
  email_2: 'nchen26@mylcusd.net',
  meeting_1: 'Grades 9–10 | Monday, 3:30–5:00 PM | Room 217',
  meeting_2: 'Grades 7–8 | Wednesday, 3:30–4:30 PM | Room 724',
  announcement_text:
    'Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Cañada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!',
}

// ----------------------------------------------------------------------------
// Public API — same names + signatures as the previous Notion-backed layer.
// RLS policies on the Supabase side handle:
//   - announcements: anonymous users only see members_only=false
//   - events: only published rows
//   - officers: only published rows
// ----------------------------------------------------------------------------

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  try {
    // Filter to today and earlier; auto-publish/unpublish by date is enforced here.
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, date, pinned, members_only')
      .eq('published', true)
      .order('pinned', { ascending: false })
      .order('date', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body ?? '',
      date: row.date,
      pinned: row.pinned ?? false,
      membersOnly: row.members_only ?? false,
    }))
  } catch (e) {
    console.error('Failed to fetch announcements from Supabase:', e)
    return []
  }
}

export async function fetchEvents(): Promise<Event[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return fallbackEvents
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('events')
      .select('id, name, date, location, grades, sign_up_link, volunteer_link, page_link, description')
      .eq('published', true)
      .gte('date', today)
      .order('date', { ascending: true })
    if (error) throw error
    const rows = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date,
      location: row.location ?? '',
      grades: row.grades ?? '',
      signUpLink: row.sign_up_link ?? '',
      volunteerLink: row.volunteer_link ?? '',
      pageLink: row.page_link ?? '',
      description: row.description ?? '',
    }))
    return rows.length > 0 ? rows : fallbackEvents
  } catch (e) {
    console.error('Failed to fetch events from Supabase:', e)
    return fallbackEvents
  }
}

export async function fetchOfficers(): Promise<Officer[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return fallbackOfficers
  try {
    const { data, error } = await supabase
      .from('officers')
      .select('id, name, role, order_idx, photo_url, school_year')
      .eq('published', true)
      .order('order_idx', { ascending: true })
    if (error) throw error
    const rows = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      order: row.order_idx ?? 0,
      photoUrl: row.photo_url ?? null,
      schoolYear: row.school_year ?? '',
    }))
    return rows.length > 0 ? rows : fallbackOfficers
  } catch (e) {
    console.error('Failed to fetch officers from Supabase:', e)
    return fallbackOfficers
  }
}

export async function fetchConfig(): Promise<SiteConfig> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return fallbackConfig
  try {
    const { data, error } = await supabase.from('site_config').select('key, value')
    if (error) throw error
    const config: SiteConfig = { ...fallbackConfig }
    for (const row of data ?? []) {
      if (row.key) config[row.key] = row.value ?? ''
    }
    return config
  } catch (e) {
    console.error('Failed to fetch site config from Supabase:', e)
    return fallbackConfig
  }
}

export async function fetchEventByName(name: string): Promise<Event | null> {
  const events = await fetchEvents()
  return events.find((e) => e.name.toLowerCase().includes(name.toLowerCase())) ?? null
}
