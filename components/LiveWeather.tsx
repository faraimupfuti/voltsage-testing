'use client'
import { useEffect, useState } from 'react'
import { Sun, Cloud, CloudSun, Wind, Droplets, Gauge, MoonStar } from 'lucide-react'

interface WeatherData {
  location: { name: string; country: string; localtime: string }
  current: {
    tempC: number; feelslikeC: number; description: string; icon: string | null
    humidity: number; windKph: number; windDir: string; cloudcover: number
    uvIndex: number; isDay: boolean; observationTime: string
  }
}

function solarOutlook(c: WeatherData['current']) {
  if (!c.isDay) return { label: 'Night — solar generation resumes at sunrise', tone: 'slate' as const }
  if (c.cloudcover < 20 && c.uvIndex >= 6) return { label: 'Excellent conditions for solar generation today', tone: 'green' as const }
  if (c.cloudcover < 55) return { label: 'Good conditions for solar generation today', tone: 'amber' as const }
  return { label: 'Cloudy skies — expect reduced solar output today', tone: 'slate' as const }
}

const TONE_DOT: Record<string, string> = { green: '#16a34a', amber: '#2621FF', slate: '#64748b' }

export default function LiveWeather() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/weather?city=Harare')
      .then(r => r.json())
      .then(json => { if (!cancelled) { if (json.ok) setData(json); else setFailed(true) } })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [])

  if (failed) return null // fail silently — never break the page for site visitors

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="gradient-border rounded-2xl overflow-hidden">
          <div className="card-flat px-5 sm:px-7 py-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            {!data ? (
              <WeatherSkeleton />
            ) : (
              <>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 sun-pulse" style={{ background: data.current.isDay ? 'linear-gradient(135deg,#FDE047,#F59E0B)' : 'linear-gradient(135deg,#334155,#0B1220)' }}>
                    {data.current.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.current.icon} alt={data.current.description} className="w-9 h-9 object-contain drop-shadow" />
                    ) : data.current.isDay ? (
                      <Sun size={26} className="text-white sun-rays" strokeWidth={2} />
                    ) : (
                      <MoonStar size={24} className="text-white" strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-disp font-extrabold text-3xl text-ink">{Math.round(data.current.tempC)}°</span>
                      <span className="text-xs font-mono text-ink-faint uppercase">C · feels {Math.round(data.current.feelslikeC)}°</span>
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-wide text-ink-muted">{data.current.description} · {data.location.name}, {data.location.country}</div>
                  </div>
                </div>

                <div className="hidden sm:block w-px self-stretch bg-surface-border" />

                <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
                  <Stat icon={Gauge} label="UV Index" value={String(data.current.uvIndex)} />
                  <Stat icon={data.current.isDay ? CloudSun : Cloud} label="Cloud cover" value={`${data.current.cloudcover}%`} />
                  <Stat icon={Droplets} label="Humidity" value={`${data.current.humidity}%`} />
                  <Stat icon={Wind} label="Wind" value={`${Math.round(data.current.windKph)} km/h ${data.current.windDir}`} />
                </div>

                <div className="hidden lg:block w-px self-stretch bg-surface-border" />

                {(() => {
                  const outlook = solarOutlook(data.current)
                  return (
                    <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: TONE_DOT[outlook.tone] }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TONE_DOT[outlook.tone] }} />
                      </span>
                      <span className="text-[12px] font-mono text-ink-muted max-w-[220px] leading-snug">{outlook.label}</span>
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-brand-teal" />
      </div>
      <div>
        <div className="text-[9px] font-mono uppercase tracking-widest text-ink-faint">{label}</div>
        <div className="text-xs font-mono font-semibold text-ink">{value}</div>
      </div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div className="flex items-center gap-4 w-full animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-surface-subtle flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-xs">
        <div className="h-5 w-24 bg-surface-subtle rounded" />
        <div className="h-3 w-40 bg-surface-subtle rounded" />
      </div>
    </div>
  )
}
