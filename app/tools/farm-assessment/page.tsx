import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import AgriculturalTool from '@/components/tools/AgriculturalTool'
import ToolPageHeader from '@/components/tools/ToolPageHeader'
import { toolUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Farm Load Assessment Tool',
  description: 'Premium agricultural load assessment. Accounts for motor starting surges on irrigation pumps, poultry, dairy and crop-processing equipment to size the right solar/battery system.',
  alternates: { canonical: toolUrl('agricultural') },
}

export default function FarmAssessmentPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <ToolPageHeader toolName="Farm Load Assessment" url={toolUrl('agricultural')} />
        <AgriculturalTool />
      </main>
      <Footer />
    </>
  )
}
