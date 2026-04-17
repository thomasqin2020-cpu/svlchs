import { Client } from '@notionhq/client'
import type { Announcement, Event, Officer, SiteConfig } from '@/types/content'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Helper to safely extract a property value from a Notion page
function prop(page: Record<string, unknown>, name: string): unknown {
  const props = page.properties as Record<string, Record<string, unknown>> | undefined
  return props?.[name]
}

function richTextToString(rt: unknown): string {
  if (!Array.isArray(rt)) return ''
  return rt.map((t: Record<string, unknown>) => (t.plain_text as string) || '').join('')
}

function getPropValue(p: Record<string, unknown>): string {
  const type = p.type as string
  switch (type) {
    case 'title':
      return richTextToString(p.title)
    case 'rich_text':
      return richTextToString(p.rich_text)
    case 'date':
      return ((p.date as Record<string, unknown>)?.start as string) || ''
    case 'url':
      return (p.url as string) || ''
    case 'select':
      return ((p.select as Record<string, unknown>)?.name as string) || ''
    case 'number':
      return String(p.number ?? '')
    case 'checkbox':
      return String(p.checkbox ?? false)
    default:
      return ''
  }
}

function getStringProp(page: Record<string, unknown>, name: string): string {
  const p = prop(page, name) as Record<string, unknown> | undefined
  if (!p) return ''
  return getPropValue(p)
}

function getBoolProp(page: Record<string, unknown>, name: string): boolean {
  const p = prop(page, name) as Record<string, unknown> | undefined
  if (!p) return false
  return (p.checkbox as boolean) ?? false
}

function getNumberProp(page: Record<string, unknown>, name: string): number {
  const p = prop(page, name) as Record<string, unknown> | undefined
  if (!p) return 0
  return (p.number as number) ?? 0
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ANNOUNCEMENTS_DB!,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })

  return response.results.map((page) => {
    const p = page as unknown as Record<string, unknown>
    return {
      id: p.id as string,
      title: getStringProp(p, 'Title') || getStringProp(p, 'Name'),
      body: getStringProp(p, 'Body') || getStringProp(p, 'Description'),
      date: getStringProp(p, 'Date'),
      pinned: getBoolProp(p, 'Pinned'),
    }
  })
}

export async function getEvents(): Promise<Event[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_EVENTS_DB!,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Date', direction: 'ascending' }],
  })

  return response.results.map((page) => {
    const p = page as unknown as Record<string, unknown>
    return {
      id: p.id as string,
      name: getStringProp(p, 'Name') || getStringProp(p, 'Title'),
      date: getStringProp(p, 'Date'),
      location: getStringProp(p, 'Location'),
      grades: getStringProp(p, 'Grades'),
      signUpLink: getStringProp(p, 'Sign Up Link') || getStringProp(p, 'SignUpLink'),
      volunteerLink: getStringProp(p, 'Volunteer Link') || getStringProp(p, 'VolunteerLink'),
      pageLink: getStringProp(p, 'Page Link') || getStringProp(p, 'PageLink'),
      description: getStringProp(p, 'Description') || getStringProp(p, 'Body'),
    }
  })
}

export async function getOfficers(): Promise<Officer[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_OFFICERS_DB!,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Order', direction: 'ascending' }],
  })

  return response.results.map((page) => {
    const p = page as unknown as Record<string, unknown>
    return {
      id: p.id as string,
      name: getStringProp(p, 'Name') || getStringProp(p, 'Title'),
      role: getStringProp(p, 'Role'),
      order: getNumberProp(p, 'Order'),
    }
  })
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_CONFIG_DB!,
  })

  const config: SiteConfig = {}
  for (const page of response.results) {
    const p = page as unknown as Record<string, unknown>
    const key = getStringProp(p, 'Key') || getStringProp(p, 'Name') || getStringProp(p, 'Title')
    const value = getStringProp(p, 'Value')
    if (key) config[key] = value
  }
  return config
}

// Fetch a single event by name (for VMT/Aleph pages)
export async function getEventByName(name: string): Promise<Event | null> {
  const events = await getEvents()
  return events.find((e) => e.name.toLowerCase().includes(name.toLowerCase())) || null
}
