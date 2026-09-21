import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import ResidentialTool from '@/components/tools/ResidentialTool'
import ToolPageHeader from '@/components/tools/ToolPageHeader'
import { toolUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Home Energy Assessment Tool',
  description: 'Premium residential & small-commercial energy assessment. Add your appliances and operating times to get accurate inverter, battery and PV array sizing — built by a qualified electrical engineer.',
  alternates: { canonical: toolUrl('residential') },
}

export default function EnergyAssessmentPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <ToolPageHeader toolName="Home Energy Assessment" url={toolUrl('residential')} />
        <ResidentialTool />
      </main>
      <Footer />
    </>
  )
}
