export interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
  membersOnly: boolean
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
  photoUrl: string | null
  schoolYear: string
}

export type SiteConfig = Record<string, string>

export interface Member {
  id: string
  email: string
  fullName: string | null
  grade: string | null
  schoolYear: string | null
  role: 'member' | 'admin'
}
