'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { readConsent, CONSENT_EVENT, ConsentValue } from './CookieConsent'

export default function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const existing = readConsent()
    if (existing) setAllowed(existing.analytics)

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentValue>).detail
      setAllowed(!!detail?.analytics)
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!allowed) return null

  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id="8943deb8-9bcf-418b-aa6d-7c88175e3ca8"
      strategy="afterInteractive"
    />
  )
}
