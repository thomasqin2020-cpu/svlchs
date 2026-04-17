export interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
}

export interface Event {
  id: string
  name: string
  date: string
  location: string
  grades: string
  signUpLink: string
  volunteerLink: string
  pageLink: string
  description: string
}

export interface Officer {
  id: string
  name: string
  role: string
  order: number
}

export type SiteConfig = Record<string, string>
