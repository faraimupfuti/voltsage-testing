import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'
import Reveal from '@/components/Reveal'
import FounderQrCard from '@/components/FounderQrCard'
import { Zap, ShieldCheck, Gauge } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Founder',
  description: 'Meet Nyasha Mpofu, founder of VoltSage and an Electrical Engineer.',
}

const EXPERTISE = [
  { icon: Zap, label: 'Electrical Engineering' },
  { icon: Gauge, label: 'Solar System Design' },
  { icon: ShieldCheck, label: 'Load & Sizing Analysis' },
]

export default function FoundersPage() {
  return (
    <>
      <Header />
      <main className="bg-white overflow-hidden">
        <section className="relative pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="absolute top-10 right-0 w-[420px] h-[420px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(27,23,255,0.06) 0%,transparent 70%)'}}/>
          <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none orb-pulse" style={{background:'radial-gradient(circle,rgba(15,23,42,0.06) 0%,transparent 70%)',animationDelay:'2s'}}/>

          <Reveal>
            <div className="section-eyebrow justify-center text-center mx-auto">Leadership</div>
            <h1 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight text-center mb-16">Meet the <span className="brand-text">Founder</span></h1>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 lg:gap-16 items-start">
            {/* Photo */}
            <Reveal delay={80}>
              <div className="tool-frame max-w-sm mx-auto lg:mx-0 transition-transform duration-500 hover:-translate-y-1.5">
                <div className="tool-frame-inner relative aspect-[4/5]">
                  <Image src="/nyasha-mpofu.jpg" alt="Nyasha Mpofu, Founder of VoltSage and Electrical Engineer" fill className="object-cover object-top" priority/>
                </div>
              </div>
            </Reveal>

            {/* Profile */}
            <Reveal delay={140}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-brand-orange mb-2">Founder</div>
              <h2 className="font-disp font-bold text-3xl sm:text-4xl text-ink mb-1">Nyasha Mpofu</h2>
              <p className="text-sm font-mono text-ink-faint uppercase tracking-wide mb-6">Electrical Engineer</p>

              <p className="text-base text-ink-muted leading-relaxed mb-4">
                Nyasha Mpofu is the founder of VoltSage and an Electrical Engineer. She started VoltSage to
                close the gap between what solar buyers are told and what the numbers actually say — building free,
                engineering-led tools that size a system correctly <em className="not-italic text-ink font-medium">before</em> a
                single panel is bought, not after.
              </p>
              <p className="text-base text-ink-muted leading-relaxed mb-8">
                Her background in electrical engineering underpins every calculation behind VoltSage's sizing tools —
                from real 24-hour load profiling to accounting for motor starting surge on agricultural equipment.
                It's the same principle across every tool VoltSage builds: no guesswork, no oversized quotes,
                just the correct system size, explained in plain language.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-10">
                {EXPERTISE.map(({icon:Icon,label})=>(
                  <div key={label} className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-surface-border bg-surface-subtle text-xs font-mono text-ink-muted transition-all hover:border-brand-teal/40 hover:bg-teal-50 hover:text-brand-teal hover:-translate-y-0.5">
                    <Icon size={13} className="text-brand-orange transition-transform group-hover:scale-110"/> {label}
                  </div>
                ))}
              </div>

              <FounderQrCard/>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  )
}
