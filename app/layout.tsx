import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { AccessProvider } from '@/components/AccessGate'
import { SiteProvider } from '@/components/SiteProvider'
import { LanguageProvider } from '@/components/LanguageProvider'
import Boujie from '@/components/Boujie'
import { SITE_URL } from '@/lib/site'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VoltSage Solutions — Premium Solar Energy Assessment & System Sizing Tools',
    template: '%s | VoltSage Solutions',
  },
  description: 'Engineer-grade energy assessment & system sizing tools for homes, farms and businesses. Get precise inverter, battery, solar panel and DC cable sizing before you buy — built by a qualified electrical engineer. Independent advice. No equipment sold, ever.',
  keywords: [
    'solar sizing tool', 'solar calculator', 'solar panel calculator', 'inverter sizing calculator',
    'battery sizing calculator', 'battery runtime calculator', 'off-grid solar calculator',
    'energy assessment tool', 'load assessment tool', 'system sizing calculator', 'DC cable sizing calculator',
    'IEC cable sizing', 'voltage drop calculator', 'agricultural solar', 'solar for farms',
    'irrigation solar pump sizing', 'renewable energy Zimbabwe', 'solar power Zimbabwe', 'solar calculator Africa',
    'load shedding solutions', 'solar installation guide', 'how many solar panels do I need',
    'kWh solar calculator', 'PV array sizing', 'depth of discharge calculator', 'peak sun hours calculator',
    'premium solar tools', 'VoltSage',
  ],
  authors: [{ name: 'Farai Mupfuti', url: SITE_URL }],
  creator: 'Farai Mupfuti',
  publisher: 'VoltSage Solutions',
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  verification: { google: 'poEu6LNU4B2X6o_JeJOGD_UA3HthC6hiCxMOxlUQkGk' },
  openGraph: {
    title: 'VoltSage Solutions — Don\'t Buy Solar Until You Know What You Need',
    description: 'Premium, engineer-grade energy assessment & system sizing tools — inverter, battery, solar panels and DC cables — for homes, farms and businesses. Independent advice, no equipment sold.',
    type: 'website',
    url: SITE_URL,
    siteName: 'VoltSage Solutions',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VoltSage Solutions — premium solar energy assessment & sizing tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltSage Solutions — Premium Solar Energy Assessment Tools',
    description: "Don't buy solar until you know what you need. Engineer-grade tools to size your inverter, battery, solar panels and DC cables.",
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
        description: 'VoltSage Solutions builds premium, engineer-led solar energy assessment and system sizing tools for homes, farms and businesses.',
      },
      {
        '@type': 'WebApplication',
        name: 'VoltSage Solar Energy Assessment & Sizing Tools',
        url: SITE_URL,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web-based)',
        description: 'Premium, engineer-grade solar energy assessment tools: residential and small-commercial load assessment, agricultural load assessment for irrigation/dairy/poultry, battery runtime assessment, and IEC-based DC cable sizing.',
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
      <body className="bg-white text-slate-900 antialiased"><LanguageProvider><AccessProvider><SiteProvider>{children}<Boujie/></SiteProvider></AccessProvider></LanguageProvider></body>
    </html>
  )
}
