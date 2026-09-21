import { Sun, Satellite, Sparkles, Clock, Globe2, History, CalendarClock, Layers, Compass, SunMedium, ScanLine, Gauge } from 'lucide-react'
import Reveal from './Reveal'

const TOOLS = [
  {
    icon: SunMedium,
    accent: '#2621FF',
    eyebrow: 'Forecasting & Historical Data',
    name: 'Solar Panel Energy Prediction',
    tagline: "Get the exact power output of a specific solar panel — based on its own technical characteristics, for any location on Earth.",
    features: [
      { icon: Layers, text: 'Create an unlimited number of solar panel configurations for any location, with your own desired specifications' },
      { icon: CalendarClock, text: 'Current conditions plus a 15-day forecast of solar panel power output' },
      { icon: History, text: '47+ years of historical data, dating back to January 1, 1979' },
      { icon: Gauge, text: 'Daily aggregation with 1-hour and 15-minute step detail for any specified day' },
      { icon: Globe2, text: 'Available worldwide, for any panel and any site' },
    ],
  },
  {
    icon: Satellite,
    accent: '#171254',
    eyebrow: 'Imagery-Based Rooftop Design',
    name: 'VoltSage Solar Design',
    tagline: 'Point it at a rooftop and get an instant, imagery-based solar design — usable roof area, shading and expected output, before a single panel is ordered.',
    features: [
      { icon: ScanLine, text: 'Instant rooftop analysis from satellite & aerial imagery — just enter an address' },
      { icon: Compass, text: 'Automatic detection of usable roof area and optimal panel placement' },
      { icon: Sun, text: 'Shading and sun-exposure analysis across the full year' },
      { icon: Sparkles, text: 'Estimated annual solar potential and expected energy output for that specific roof' },
      { icon: Globe2, text: 'Available worldwide, down to individual rooftops' },
    ],
  },
]

export default function ComingSoon() {
  return (
    <section id="coming-soon" className="py-24 bg-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="section-eyebrow">In development</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink leading-tight mb-4">
            Coming soon to<br /><span className="brand-text-teal">the VoltSage toolkit</span>
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            We're building the next generation of premium assessment tools — sharper forecasting, deeper historical
            data, and rooftop-level solar design. Here's what's on the way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Reveal key={tool.name} delay={i * 120} className="gradient-border rounded-2xl overflow-hidden h-full">
                <div className="card-flat relative h-full flex flex-col p-7 sm:p-8 overflow-hidden">
                  {/* decorative glow orb */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none orb-pulse" style={{ background: tool.accent }} />

                  <div className="flex items-start justify-between mb-5 relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 sun-pulse" style={{ background: `linear-gradient(135deg, ${tool.accent}, #0B1220)` }}>
                      <Icon size={22} className="text-white" strokeWidth={2} />
                    </div>
                    <span className="badge badge-orange">
                      <Clock size={11} className="soft-bob" /> Coming Soon
                    </span>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink-faint mb-2 relative">{tool.eyebrow}</div>
                  <h3 className="font-disp font-extrabold text-2xl text-ink leading-snug mb-3 relative">{tool.name}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed mb-6 relative">{tool.tagline}</p>

                  <ul className="space-y-3 mb-7 relative flex-1">
                    {tool.features.map(f => {
                      const FIcon = f.icon
                      return (
                        <li key={f.text} className="flex items-start gap-2.5 text-[12.5px] text-ink-muted leading-snug">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${tool.accent}14` }}>
                            <FIcon size={11} style={{ color: tool.accent }} />
                          </span>
                          <span>{f.text}</span>
                        </li>
                      )
                    })}
                  </ul>

                  <a href="#contact" className="relative inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-ink border border-surface-border hover:border-brand-teal/40 hover:text-brand-teal transition-colors rounded-lg px-4 py-2.5 self-start">
                    <Sparkles size={13} /> Notify me when it launches
                  </a>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
