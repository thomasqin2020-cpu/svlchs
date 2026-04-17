import SpartanVanguard from "@/components/spartan-vanguard"
import { fetchAnnouncements, fetchEvents, fetchOfficers, fetchConfig } from "@/lib/data"

export const revalidate = 60

export default async function Home() {
  const [announcements, events, officers, config] = await Promise.all([
    fetchAnnouncements(),
    fetchEvents(),
    fetchOfficers(),
    fetchConfig(),
  ])

  return (
    <SpartanVanguard
      announcements={announcements}
      events={events}
      officers={officers}
      config={config}
    />
  )
}
