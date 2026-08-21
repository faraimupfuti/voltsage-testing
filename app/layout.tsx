import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { AccessProvider } from '@/components/AccessGate'
import { LanguageProvider } from '@/components/LanguageProvider'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const SITE_URL = 'https://voltsage.co'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VoltSage Solutions — Free Solar Sizing Calculator & Energy Tools',
    template: '%s | VoltSage Solutions',
  },
  description: 'Free solar sizing tools for homes, farms and businesses. Calculate the right inverter, battery and solar panel size for your property before you buy — plus a battery runtime calculator and agricultural solar sizing for irrigation, dairy and poultry. No sign-up cost, no equipment sold.',
  keywords: [
    'solar sizing tool', 'solar calculator', 'solar panel calculator', 'inverter sizing calculator',
    'battery sizing calculator', 'battery runtime calculator', 'off-grid solar calculator',
    'agricultural solar', 'solar for farms', 'irrigation solar pump sizing', 'renewable energy Zimbabwe',
    'solar power Zimbabwe', 'solar calculator Africa', 'load shedding solutions', 'solar installation guide',
    'how many solar panels do I need', 'kWh solar calculator', 'PV array sizing', 'depth of discharge calculator',
    'peak sun hours calculator', 'free solar tools', 'VoltSage',
  ],
  authors: [{ name: 'Farai Mupfuti', url: SITE_URL }],
  creator: 'Farai Mupfuti',
  publisher: 'VoltSage Solutions',
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  verification: { google: 'poEu6LNU4B2X6o_JeJOGD_UA3HthC6hiCxMOxlUQkGk' },
  openGraph: {
    title: 'VoltSage Solutions — Free Solar Sizing Calculator & Energy Tools',
    description: "Don't buy solar until you know what you need. Free tools to size your inverter, battery and solar panels — for homes, farms and businesses.",
    type: 'website',
    url: SITE_URL,
    siteName: 'VoltSage Solutions',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VoltSage Solutions — free solar sizing tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltSage Solutions — Free Solar Sizing Calculator',
    description: "Don't buy solar until you know what you need. Free tools to size your inverter, battery and solar panels.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

/**
 * VoltSage Solutions
 * Built by Farai Mupfuti — voltsage.co
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'VoltSage Solutions',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        founder: { '@type': 'Person', name: 'Farai Mupfuti' },
        description: 'VoltSage Solutions builds free, engineering-led solar sizing tools for homes, farms and businesses.',
      },
      {
        '@type': 'WebApplication',
        name: 'VoltSage Solar Sizing Tools',
        url: SITE_URL,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web-based)',
        description: 'Free solar sizing tools: residential and small-commercial sizing, agricultural solar sizing for irrigation/dairy/poultry, and a battery runtime calculator.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: 'Farai Mupfuti' },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Umami analytics */}
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="8943deb8-9bcf-418b-aa6d-7c88175e3ca8" strategy="afterInteractive" />
      </head>
      <body className="bg-white text-slate-900 antialiased"><LanguageProvider><AccessProvider>{children}</AccessProvider></LanguageProvider></body>
    </html>
  )
}
