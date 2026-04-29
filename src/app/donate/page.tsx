import type { Metadata } from 'next'
import { DonateClient } from './donate-client'

export const metadata: Metadata = {
  title: 'Donate · Spartan Vanguard',
  description:
    'Support the La Cañada High School math club. Donations cover testing materials, pizza, competition fees, and travel.',
}

export default function DonatePage() {
  return <DonateClient />
}
