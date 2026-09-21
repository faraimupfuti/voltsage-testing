import crypto from 'crypto'

const SECRET = process.env.COOKIE_SECRET || 'voltsage-dev-secret-change-me'
export const ADV_COOKIE = 'voltsage_adv'

export interface AdvPayload {
  email: string
  customerId: string
  subscriptionId: string
  exp: number
}

/** Sign a JSON-serialisable payload into a compact, tamper-proof token. */
export function signPayload(payload: object): string {
  const json = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(json).digest('hex')
  return `${json}.${sig}`
}

/** Verify and decode a token produced by signPayload. Returns null if invalid, tampered, or expired. */
export function verifyPayload<T = any>(token: string | undefined | null): T | null {
  if (!token) return null
  const [json, sig] = token.split('.')
  if (!json || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(json).digest('hex')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(json, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload as T
  } catch {
    return null
  }
}
