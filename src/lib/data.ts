import { getAnnouncements, getEvents, getOfficers, getSiteConfig, getEventByName } from './notion'
import type { Announcement, Event, Officer, SiteConfig } from '@/types/content'

// Hardcoded fallback data (used when Notion API is unavailable)
const fallbackEvents: Event[] = [
  {
    id: 'vmt-fallback',
    name: 'Vanguard Math Tournament',
    date: 'February 21, 2026',
    location: 'La Cañada High School',
    grades: 'Grades 6–8',
    signUpLink: 'https://forms.gle/uhmyxkM4V5vCXHQy7',
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
    signUpLink: 'https://forms.gle/VSPZMyGM9fT1wndq9',
    volunteerLink: 'https://forms.gle/NDthbirThVbnxmW37',
    pageLink: '/aleph',
    description: 'High school math competition for grades 9–12.',
  },
]

const fallbackOfficers: Officer[] = [
  { id: '1', name: 'Victoria Chen', role: 'Co-President', order: 1 },
  { id: '2', name: 'Nathaniel Chen', role: 'Co-President', order: 2 },
  { id: '3', name: 'Leo Wang', role: 'Secretary', order: 3 },
  { id: '4', name: 'Khunhoon Lee', role: 'Treasurer', order: 4 },
  { id: '5', name: 'Dohhoon Lee', role: 'Competition & Web Manager', order: 5 },
  { id: '6', name: 'Max Tieu', role: 'Publicity Chair', order: 6 },
]

const fallbackConfig: SiteConfig = {
  google_classroom: 'hsx4c54',
  remind: '@lchssv',
  email_1: 'vchen26@mylcusd.net',
  email_2: 'nchen26@mylcusd.net',
  meeting_1: 'Grades 9–10 | Monday, 3:30–5:00 PM | Room 217',
  meeting_2: 'Grades 7–8 | Wednesday, 3:30–4:30 PM | Room 724',
  announcement_text: 'Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Cañada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!',
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    if (!process.env.NOTION_API_KEY) return []
    return await getAnnouncements()
  } catch (e) {
    console.error('Failed to fetch announcements from Notion:', e)
    return []
  }
}

export async function fetchEvents(): Promise<Event[]> {
  try {
    if (!process.env.NOTION_API_KEY) return fallbackEvents
    const events = await getEvents()
    return events.length > 0 ? events : fallbackEvents
  } catch (e) {
    console.error('Failed to fetch events from Notion:', e)
    return fallbackEvents
  }
}

export async function fetchOfficers(): Promise<Officer[]> {
  try {
    if (!process.env.NOTION_API_KEY) return fallbackOfficers
    const officers = await getOfficers()
    return officers.length > 0 ? officers : fallbackOfficers
  } catch (e) {
    console.error('Failed to fetch officers from Notion:', e)
    return fallbackOfficers
  }
}

export async function fetchConfig(): Promise<SiteConfig> {
  try {
    if (!process.env.NOTION_API_KEY) return fallbackConfig
    const config = await getSiteConfig()
    return Object.keys(config).length > 0 ? { ...fallbackConfig, ...config } : fallbackConfig
  } catch (e) {
    console.error('Failed to fetch config from Notion:', e)
    return fallbackConfig
  }
}

export async function fetchEventByName(name: string): Promise<Event | null> {
  try {
    if (!process.env.NOTION_API_KEY) {
      return fallbackEvents.find((e) => e.name.toLowerCase().includes(name.toLowerCase())) || null
    }
    const event = await getEventByName(name)
    return event || fallbackEvents.find((e) => e.name.toLowerCase().includes(name.toLowerCase())) || null
  } catch (e) {
    console.error(`Failed to fetch event "${name}" from Notion:`, e)
    return fallbackEvents.find((ev) => ev.name.toLowerCase().includes(name.toLowerCase())) || null
  }
}
