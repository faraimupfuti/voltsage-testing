import Header from '@/components/Header'
import Hero from '@/components/Hero'
import LiveWeather from '@/components/LiveWeather'
import WhyTools from '@/components/WhyTools'
import ProblemsSection from '@/components/ProblemsSection'
import ResidentialTool from '@/components/tools/ResidentialTool'
import AgriculturalTool from '@/components/tools/AgriculturalTool'
import BatteryRuntimeTool from '@/components/tools/BatteryRuntimeTool'
import DCCableSizingTool from '@/components/tools/DCCableSizingTool'
import ComingSoon from '@/components/ComingSoon'
import ArticlesSection from '@/components/ArticlesSection'
import { ContactSection, Footer } from '@/components/ContactAndFooter'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LiveWeather />
        <WhyTools />
        <ProblemsSection />
        <ResidentialTool />
        <AgriculturalTool />
        <BatteryRuntimeTool />
        <DCCableSizingTool />
        <ComingSoon />
        <ArticlesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
