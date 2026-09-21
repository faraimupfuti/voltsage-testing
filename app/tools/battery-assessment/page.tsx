import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import BatteryRuntimeTool from '@/components/tools/BatteryRuntimeTool'
import ToolPageHeader from '@/components/tools/ToolPageHeader'
import { toolUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Battery Runtime Assessment Tool',
  description: 'Premium battery runtime assessment. Enter battery size, depth of discharge, efficiency and load to get the real hours of backup — before you buy a battery.',
  alternates: { canonical: toolUrl('battery') },
}

export default function BatteryAssessmentPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <ToolPageHeader toolName="Battery Runtime Assessment" url={toolUrl('battery')} />
        <BatteryRuntimeTool />
      </main>
      <Footer />
    </>
  )
}
