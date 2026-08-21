import { NextRequest, NextResponse } from 'next/server'

// Enquiries are delivered via the Make.com webhook below (same scenario the
// signup form uses, distinguished by "source"). Direct SMTP sending was
// removed — Make.com is now the only delivery path for this form.
const ENQUIRY_WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/31ls9gmabfxdakkfia5t9lthf0ucb3fg'

export async function POST(req: NextRequest) {
  let data: any
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const name = String(data.name || '').trim().slice(0, 200)
  const contact = String(data.contact || '').trim().slice(0, 200)
  const service = String(data.service || 'General enquiry').trim().slice(0, 200)
  const location = String(data.location || '').trim().slice(0, 200)
  const message = String(data.message || '').trim().slice(0, 5000)

  if (!name || !contact) {
    return NextResponse.json({ ok: false, error: 'Please add your name and contact details.' }, { status: 400 })
  }

  try {
    const res = await fetch(ENQUIRY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, contact, service, location, message,
        source: 'voltsage-contact-form',
        page: req.headers.get('referer') || undefined,
        ts: new Date().toISOString(),
      }),
    })
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '')
      console.error(`Enquiry webhook responded ${res.status}: ${bodyText.slice(0, 300)}`)
      return NextResponse.json({ ok: false, error: 'Could not send your enquiry right now. Please try again shortly.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Enquiry webhook failed:', err)
    return NextResponse.json({ ok: false, error: 'Could not send your enquiry right now. Please try again shortly.' }, { status: 502 })
  }
}
