import Header from '@/components/Header'
import Hero from '@/components/Hero'
import WhyTools from '@/components/WhyTools'
import ProblemsSection from '@/components/ProblemsSection'
import ResidentialTool from '@/components/tools/ResidentialTool'
import AgriculturalTool from '@/components/tools/AgriculturalTool'
import BatteryRuntimeTool from '@/components/tools/BatteryRuntimeTool'
import ArticlesSection from '@/components/ArticlesSection'
import { ContactSection, Footer } from '@/components/ContactAndFooter'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyTools />
        <ProblemsSection />
        <ResidentialTool />
        <AgriculturalTool />
        <BatteryRuntimeTool />
        <ArticlesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
