/**
 * Top-level homepage sections that an admin can reorder, hide, and re-title.
 * These match the existing #home / #competitions / #resources / #vmt / #aleph
 * / #team page-sections in src/components/spartan-vanguard.tsx.
 *
 * The "home" section (hero + announcements + meetings) is included so admins
 * can move the rest of the page above or below it, but its hero copy is left
 * alone — the title/subtitle here only affect the section's own intro text
 * for the others. Home stays visible by default; we still allow toggling it
 * off in case the admin wants a focused page (e.g., during a launch).
 */
export const SECTION_IDS = [
  'home',
  'competitions',
  'resources',
  'vmt',
  'aleph',
  'team',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface LayoutSection {
  id: SectionId
  label: string // human-readable label shown in admin UI
  visible: boolean
  title: string // overrides the section's hero h2
  subtitle: string // overrides the section's hero subtitle paragraph
}

export interface SiteLayoutData {
  sections: LayoutSection[]
}

const SECTION_DEFAULTS: Record<SectionId, { label: string; title: string; subtitle: string }> = {
  home: {
    label: 'Home (hero + announcements + meetings)',
    title: 'Spartan Vanguard Math Club.',
    subtitle:
      'Extracurricular math, problem solving, and competitions at La Cañada High School. Sharpen your skills, join a team, and compete in AMC, AIME, BMT, and more.',
  },
  competitions: {
    label: 'Competitions',
    title: 'Competitions.',
    subtitle: 'Competitions we train for and participate in during the 2025–2026 season.',
  },
  resources: {
    label: 'Resources',
    title: 'Resources.',
    subtitle: 'Study materials, practice problems, and useful links for competition math.',
  },
  vmt: {
    label: 'VMT (Vanguard Math Tournament)',
    title: 'Vanguard Math Tournament.',
    subtitle: 'Our annual middle school competition for grades 6–8.',
  },
  aleph: {
    label: 'Aleph',
    title: 'Aleph.',
    subtitle: 'Our annual high school competition for grades 9–12.',
  },
  team: {
    label: 'Team & Contact',
    title: 'Team.',
    subtitle: 'The officers building Spartan Vanguard this season.',
  },
}

export const DEFAULT_LAYOUT: SiteLayoutData = {
  sections: SECTION_IDS.map((id) => ({
    id,
    label: SECTION_DEFAULTS[id].label,
    visible: true,
    title: SECTION_DEFAULTS[id].title,
    subtitle: SECTION_DEFAULTS[id].subtitle,
  })),
}

export function getSectionLabel(id: SectionId): string {
  return SECTION_DEFAULTS[id].label
}

/** Merge an arbitrary stored layout with defaults so missing fields are filled in. */
export function normalizeLayout(stored: unknown): SiteLayoutData {
  if (!stored || typeof stored !== 'object') return DEFAULT_LAYOUT
  const s = (stored as { sections?: Partial<LayoutSection>[] }).sections
  if (!Array.isArray(s)) return DEFAULT_LAYOUT

  const seen = new Set<SectionId>()
  const ordered: LayoutSection[] = []
  for (const sec of s) {
    if (!sec || typeof sec !== 'object') continue
    const id = sec.id as SectionId
    if (!SECTION_IDS.includes(id) || seen.has(id)) continue
    seen.add(id)
    ordered.push({
      id,
      label: SECTION_DEFAULTS[id].label,
      visible: sec.visible !== false,
      title:
        typeof sec.title === 'string' && sec.title.length > 0
          ? sec.title
          : SECTION_DEFAULTS[id].title,
      subtitle:
        typeof sec.subtitle === 'string' ? sec.subtitle : SECTION_DEFAULTS[id].subtitle,
    })
  }
  // Append any sections missing from the stored layout (e.g., after a code update).
  for (const id of SECTION_IDS) {
    if (!seen.has(id)) {
      ordered.push({
        id,
        label: SECTION_DEFAULTS[id].label,
        visible: true,
        title: SECTION_DEFAULTS[id].title,
        subtitle: SECTION_DEFAULTS[id].subtitle,
      })
    }
  }
  return { sections: ordered }
}
