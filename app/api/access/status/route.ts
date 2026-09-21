import { NextRequest, NextResponse } from 'next/server'
import { verifyPayload, ADV_COOKIE, AdvPayload } from '@/lib/accessCookie'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADV_COOKIE)?.value
  const payload = verifyPayload<AdvPayload>(token)
  return NextResponse.json({ advanced: !!payload, email: payload?.email || null })
}
