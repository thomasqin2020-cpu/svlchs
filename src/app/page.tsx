import SpartanVanguard from "@/components/spartan-vanguard"
import { fetchAnnouncements, fetchEvents, fetchOfficers, fetchConfig } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"

export const revalidate = 60

export default async function Home() {
  const [announcements, events, officers, config, currentMember] = await Promise.all([
    fetchAnnouncements(),
    fetchEvents(),
    fetchOfficers(),
    fetchConfig(),
    getCurrentMember(),
  ])

  return (
    <SpartanVanguard
      announcements={announcements}
      events={events}
      officers={officers}
      config={config}
      currentMember={currentMember}
    />
  )
}
