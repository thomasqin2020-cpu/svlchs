'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, notifyOfficers, compRegistrationAckEmail, compRegistrationNotifyEmail } from '@/lib/email'

export interface RegisterResult {
  ok: boolean
  message: string
}

const KNOWN_EVENTS: Record<string, string> = {
  vmt: 'Vanguard Math Tournament',
  aleph: 'Aleph',
}

export async function registerForCompetition(slug: string, formData: FormData): Promise<RegisterResult> {
  const eventName = KNOWN_EVENTS[slug] ?? slug

  const studentName = String(formData.get('student_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const school = String(formData.get('school') ?? '').trim()
  const grade = String(formData.get('grade') ?? '').trim()
  const parentEmail = String(formData.get('parent_email') ?? '').trim().toLowerCase()
  const notes = String(formData.get('notes') ?? '').trim()

  if (!studentName || !email) {
    return { ok: false, message: 'Student name and email are required.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Registration is not configured yet. Please email officers directly.' }
  }

  const { error } = await supabase.from('competition_registrations').insert({
    event_slug: slug,
    event_name: eventName,
    student_name: studentName,
    school: school || null,
    grade: grade || null,
    email,
    parent_email: parentEmail || null,
    notes: notes || null,
  })
  if (error) {
    console.error('competition_registrations insert failed:', error)
    return { ok: false, message: 'Could not save your registration. Please try again.' }
  }

  // Fire-and-forget confirmation + officer notification.
  sendEmail({
    to: email,
    subject: `You're registered for ${eventName}`,
    html: compRegistrationAckEmail({ studentName, eventName }),
  }).catch(() => {})
  notifyOfficers({
    subject: `New ${eventName} registration: ${studentName}`,
    html: compRegistrationNotifyEmail({ studentName, eventName, school, grade, email, parentEmail, notes }),
  }).catch(() => {})

  return {
    ok: true,
    message: `Thanks, ${studentName}! Your registration for ${eventName} is in. We'll email ${email} with details soon.`,
  }
}
