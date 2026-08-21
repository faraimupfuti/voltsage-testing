'use client'
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef, CSSProperties } from 'react'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

export interface TourStep {
  target: string
  title: string
  body: string
}

export interface TourHandle { start: () => void }

interface TourGuideProps {
  tourId: string
  steps: TourStep[]
  autoStart?: boolean
  autoStartDelay?: number
}

const PAD = 8

const TourGuide = forwardRef<TourHandle, TourGuideProps>(function TourGuide(
  { tourId, steps, autoStart = true, autoStartDelay = 900 }, ref
) {
  const [active, setActive] = useState(false)
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mobile, setMobile] = useState(false)
  // True only for the very first, automatically-triggered pop-up. Lets that
  // one appear as a fixed "toast" (no forced scroll), so several tours
  // auto-starting at once on page load don't yank the page between each
  // other's sections. Once the visitor interacts (Next/Back), normal
  // scroll-to-target behaviour takes over for the rest of that tour.
  const [isFirstAutoShow, setIsFirstAutoShow] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const key = `voltsage_tour_seen_${tourId}`

  const start = useCallback(() => { setIdx(0); setIsFirstAutoShow(false); setActive(true) }, [])
  useImperativeHandle(ref, () => ({ start }), [start])

  useEffect(() => {
    if (!autoStart) return
    let t: ReturnType<typeof setTimeout>
    try {
      if (!localStorage.getItem(key)) t = setTimeout(() => { setIdx(0); setIsFirstAutoShow(true); setActive(true) }, autoStartDelay)
    } catch { /* ignore */ }
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const measure = useCallback((skipScroll: boolean) => {
    const step = steps[idx]
    if (!step) return
    const el = document.querySelector(step.target)
    if (!el) { setRect(null); return }
    if (!skipScroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setTimeout(() => setRect(el.getBoundingClientRect()), skipScroll ? 0 : 300)
  }, [idx, steps])

  useEffect(() => { if (active) measure(isFirstAutoShow && idx === 0) }, [active, idx, measure]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) return
    const onUpdate = () => {
      const el = document.querySelector(steps[idx]?.target || '')
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', onUpdate)
    window.addEventListener('scroll', onUpdate, true)
    return () => { window.removeEventListener('resize', onUpdate); window.removeEventListener('scroll', onUpdate, true) }
  }, [active, idx, steps])

  const finish = useCallback(() => {
    setActive(false)
    try { localStorage.setItem(key, '1') } catch { /* ignore */ }
  }, [key])

  const next = useCallback(() => {
    setIsFirstAutoShow(false)
    setIdx(i => { if (i < steps.length - 1) return i + 1; finish(); return i })
  }, [steps.length, finish])
  const prev = useCallback(() => { setIsFirstAutoShow(false); setIdx(i => Math.max(0, i - 1)) }, [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, finish, next, prev])

  if (!active || !steps.length) return null
  const step = steps[idx]
  const last = idx === steps.length - 1
  const toast = isFirstAutoShow && idx === 0

  let cardStyle: CSSProperties
  if (mobile) {
    cardStyle = { position: 'fixed', left: 0, right: 0, bottom: 0, borderRadius: '20px 20px 0 0' }
  } else if (toast) {
    cardStyle = { position: 'fixed', bottom: 24, right: 24, width: 340 }
  } else if (rect) {
    const CARD_W = 320
    const spaceBelow = window.innerHeight - rect.bottom
    const placeBelow = spaceBelow > 220 || rect.top < 220
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - CARD_W - 16)
    cardStyle = placeBelow
      ? { position: 'fixed', top: rect.bottom + PAD * 2, left, width: CARD_W }
      : { position: 'fixed', bottom: window.innerHeight - rect.top + PAD * 2, left, width: CARD_W }
  } else {
    cardStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 320 }
  }

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {rect && !toast && (
        <div
          className="fixed rounded-xl transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - PAD, left: rect.left - PAD,
            width: rect.width + PAD * 2, height: rect.height + PAD * 2,
            border: '2px solid #1B17FF',
            boxShadow: '0 0 0 4px rgba(27,23,255,0.15), 0 8px 24px rgba(27,23,255,0.2)',
          }}
        />
      )}
      <div ref={cardRef} style={cardStyle} className="pointer-events-auto bg-white rounded-2xl border border-surface-border shadow-card-lg p-5 z-[201]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-orange">
            <Sparkles size={12}/> Step {idx + 1} of {steps.length}
          </div>
          <button onClick={finish} aria-label="Close tour" className="text-ink-faint hover:text-ink transition-colors flex-shrink-0"><X size={16}/></button>
        </div>
        <h4 className="font-disp font-bold text-base text-ink mb-1.5">{step.title}</h4>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">{step.body}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === idx ? '#1B17FF' : '#e2e8f0' }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {idx > 0 && (
              <button onClick={prev} className="flex items-center gap-1 text-xs font-mono uppercase text-ink-faint hover:text-ink transition-colors px-2 py-1.5">
                <ArrowLeft size={12}/> Back
              </button>
            )}
            <button onClick={next} className="btn-primary !py-1.5 !px-3 text-[11px]">
              {last ? 'Done' : 'Next'} {!last && <ArrowRight size={12}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default TourGuide
