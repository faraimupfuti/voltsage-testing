import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import DCCableSizingTool from '@/components/tools/DCCableSizingTool'
import ToolPageHeader from '@/components/tools/ToolPageHeader'
import { toolUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'DC Cable Sizing Tool',
  description: 'Premium DC cable verification for PV strings and battery connections. Checks ampacity and voltage drop against IEC 60364-5-52 reference derating data before you install.',
  alternates: { canonical: toolUrl('dcCable') },
}

export default function CableSizingPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <ToolPageHeader toolName="DC Cable Sizing Tool" url={toolUrl('dcCable')} />
        <DCCableSizingTool />
      </main>
      <Footer />
    </>
  )
}
