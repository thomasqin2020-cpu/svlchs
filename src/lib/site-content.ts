/**
 * Static content for the public site: the competition calendar, resource
 * lists, and the picture credits. Announcements, events, officers and the
 * meeting schedule come from Supabase via src/lib/data.ts.
 */

export interface Competition {
  name: string
  format: string
  where: string
  when: string
  link?: string
  internal?: string
  description: string
}

export const COMPETITIONS: Competition[] = [
  {
    name: 'Berkeley Math Tournament',
    format: 'Individual and team rounds',
    where: 'UC Berkeley',
    when: 'Fall',
    link: 'https://bmt.berkeley.edu/',
    description: 'An annual tournament at UC Berkeley with individual and team rounds. Spartan Vanguard sends teams each fall on an overnight trip.',
  },
  {
    name: 'AMC 10 and 12',
    format: '25 questions, 75 minutes',
    where: 'On campus',
    when: 'November',
    link: 'https://amc-reg.maa.org/',
    description: 'The American Mathematics Competitions open the path to the AIME and the olympiad. AMC 10 is for grade 10 and below, AMC 12 for grade 12 and below.',
  },
  {
    name: 'AIME',
    format: '15 questions, 3 hours',
    where: 'On campus',
    when: 'February',
    link: 'https://artofproblemsolving.com/wiki/index.php/AIME',
    description: 'The American Invitational Mathematics Examination, for students who score well on the AMC 10 or 12. Every answer is an integer from 000 to 999.',
  },
  {
    name: 'VMT, grades 6 to 8',
    format: 'Individual, team and buzzer rounds',
    where: 'La Cañada High School',
    when: 'February',
    internal: '/tournaments#vmt',
    description: 'Our own middle school tournament, written and run by the officers.',
  },
  {
    name: 'Aleph, grades 9 to 12',
    format: 'Individual, team and buzzer rounds',
    where: 'La Cañada High School',
    when: 'March',
    internal: '/tournaments#aleph',
    description: 'Our own high school tournament, written and run by the officers.',
  },
  {
    name: 'Stanford Math Tournament',
    format: 'Power, team, individual and guts rounds',
    where: 'Stanford',
    when: 'Spring',
    link: 'https://stanfordmathtournament.com/',
    description: 'A student-run tournament at Stanford with power, team, individual and guts rounds.',
  },
  {
    name: 'Caltech Math Meet',
    format: 'Three rounds, teams of 6',
    where: 'Caltech',
    when: 'Spring',
    link: 'https://caltechmathmeet.org/',
    description: 'An in-person meet at Caltech with three main rounds plus optional activities.',
  },
  {
    name: 'SDMHC',
    format: 'Individual and team rounds',
    where: 'San Diego',
    when: 'Spring',
    description: 'The San Diego Math Honors Contest, a Southern California competition held annually in San Diego.',
  },
  {
    name: 'Westmont Math Field Day',
    format: 'Individual and team rounds',
    where: 'Santa Barbara',
    when: 'Spring',
    description: 'A regional field day hosted by Westmont College in Santa Barbara.',
  },
]

export interface Resource {
  name: string
  description: string
  link: string
}

export const RESOURCES: Resource[] = [
  { name: 'AMC Trivial', description: 'Randomized competition problem sets with adjustable difficulty.', link: 'https://amctrivial.com/' },
  { name: 'Art of Problem Solving, Volumes 1 and 2', description: 'The standard books for AMC 8, 10, 12, AIME and beyond.', link: 'https://artofproblemsolving.com/store/book/aops-vol1' },
  { name: 'David Altizio’s geometry collection', description: '100 geometry problems from mid-AMC to IMO level.', link: 'https://davidaltizio.web.illinois.edu/CollectionOfGeometryProblems.pdf' },
  { name: 'AoPS, avoiding mistakes', description: 'An article on the common errors in competition problem solving.', link: 'https://artofproblemsolving.com/blog/articles/stop-making-stupid-mistakes' },
  { name: 'AIME problem archive', description: 'Every past AIME, with solutions.', link: 'https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions' },
  { name: 'How to Solve It, George Pólya', description: 'The classic on problem-solving method.', link: 'https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How_To_Solve_It_.pdf' },
  { name: 'AoPS resource wiki', description: 'Aggregated resources for mathematics competitions.', link: 'https://artofproblemsolving.com/wiki/index.php/Resources_for_mathematics_competitions' },
]

export const WORKSHEETS: Resource[] = [
  { name: 'Bases', description: 'Number bases practice problems.', link: 'https://drive.google.com/file/d/1xc_R8Z1LmBVqzCMbRCdx0iQIgvWaMlwo/view' },
  { name: 'Complex numbers', description: 'An introduction to complex numbers in competition math.', link: 'https://drive.google.com/file/d/1dVw1vMhqJ5IX87OU81cIY__Earx5hPOD/view' },
]

export const ACTIVITIES: Resource[] = [
  { name: 'Google Form escape room', description: 'An interactive math puzzle escape room.', link: 'https://docs.google.com/forms/d/e/1FAIpQLSfzYQFY0ZPJRMfpnZmW7gLN-OHirWjXH5LZ7xT7O_wbZ-rbww/viewform' },
  { name: 'Competition math iceberg', description: 'In progress. Topic suggestions welcome.', link: 'https://docs.google.com/file/d/109wIAfA2XgqVE4ihQ8AAKvDXlT8n49MyAbyS227wMFk/edit' },
]

export interface Photo {
  src: string
  width: number
  height: number
  alt: string
  caption: string
}

export const PHOTOS = {
  aleph3: {
    src: '/images/aleph-3-2023.jpg',
    width: 1104,
    height: 960,
    alt: 'Competitors and volunteers gathered in front of the Hotchkin Family Gymnasium at La Cañada High School',
    caption: 'Aleph-3, spring 2023, outside the Hotchkin gym.',
  },
  mathDay: {
    src: '/images/math-day-2024.jpg',
    width: 1280,
    height: 1000,
    alt: 'Students writing at tables behind cardboard dividers during a timed problem-solving round',
    caption: 'The problem-solving round at Math Day at the Beach, 2024.',
  },
  bmt: {
    src: '/images/bmt-2024.jpg',
    width: 976,
    height: 630,
    alt: 'Students spread across lecture-hall seats working through a test',
    caption: 'Berkeley Math Tournament, November 2024.',
  },
  foothills: {
    src: '/images/la-canada-foothills.jpg',
    width: 1920,
    height: 1256,
    alt: 'The San Gabriel foothills above La Cañada Flintridge with the valley in haze beyond',
    caption: 'Above La Cañada Flintridge. Photo by Tony Webster, CC BY 2.0, via Wikimedia Commons.',
  },
} satisfies Record<string, Photo>

export const CLASSROOM_CODE = 'hsx4c54'

/** Splits a managed meeting string ("Grades 9–12 | Thursday, 3:30–4:30 PM | Room 315") into its parts. */
export function parseMeeting(value: string): { who: string; when: string; where: string } {
  const [who = '', when = '', where = ''] = value.split('|').map((s) => s.trim())
  return { who, when, where }
}

/** "2027-02-21" -> "February 21, 2027"; strings that are not ISO dates pass through. */
export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return value
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
