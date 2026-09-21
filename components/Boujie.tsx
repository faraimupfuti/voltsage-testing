'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'
import { useLang } from './LanguageProvider'
import { LOCALE_LABELS } from '@/lib/i18n/dictionaries'

interface ToolCallResult { name: string; input: any; output: any }
interface ChatMsg { role: 'user' | 'assistant'; content: string; toolCalls?: ToolCallResult[] }

const GREETING: ChatMsg = {
  role: 'assistant',
  content: "Hi, I'm Boujie 👋 — VoltSage's assistant. I can tell you what VoltSage does, or walk you through sizing a solar/battery system right here in chat. What can I help with?",
}

function metricLabel(key: string) {
  const map: Record<string, string> = {
    dailyEnergyKwh: 'Daily energy', peakDemandKw: 'Peak demand', surgeDemandKw: 'Surge demand',
    recommendedInverterKw: 'Inverter', recommendedBatteryKwh: 'Battery', recommendedPvKwp: 'PV array',
    approxPanelCount550W: '≈ Panels (550W)', estimatedAutonomyHours: 'Autonomy',
    usableEnergyKwh: 'Usable energy', runtimeHoursAtGivenLoad: 'Runtime',
  }
  return map[key] ?? key
}
function metricUnit(key: string) {
  if (key.endsWith('Kwh')) return 'kWh'
  if (key.endsWith('Kw')) return 'kW'
  if (key === 'estimatedAutonomyHours' || key === 'runtimeHoursAtGivenLoad') return 'h'
  if (key === 'approxPanelCount550W') return ''
  return ''
}

function ToolResultCard({ tc }: { tc: ToolCallResult }) {
  if (tc.output?.error) return null
  const entries = Object.entries(tc.output || {}).filter(([k, v]) => typeof v === 'number')
  if (!entries.length) return null
  const title = tc.name === 'calculate_battery_runtime' ? 'Battery runtime' : 'Sizing result'
  return (
    <div className="mt-2 rounded-xl border border-surface-border bg-surface-subtle p-3">
      <div className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-2">{title}{tc.output?.location ? ` — ${tc.output.location}` : ''}</div>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg p-2 border border-surface-border">
            <div className="text-[8px] font-mono uppercase tracking-wider text-ink-faint mb-0.5">{metricLabel(k)}</div>
            <div className="font-mono font-bold text-sm text-ink leading-none">{String(v)}<span className="text-[10px] font-normal text-ink-faint ml-0.5">{metricUnit(k)}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Boujie() {
  const { locale } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || busy) return
    setError(null)
    const next: ChatMsg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          localeLabel: LOCALE_LABELS[locale],
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Boujie is having trouble responding right now.')
        setBusy(false)
        return
      }
      setMessages(m => [...m, { role: 'assistant', content: data.reply, toolCalls: data.toolCalls }])
    } catch {
      setError('Could not reach Boujie. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }, [input, busy, messages, locale])

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Chat with Boujie'}
        className="fixed bottom-5 right-5 z-[140] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-brand transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#2621FF,#171254)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[140] w-[92vw] sm:w-[380px] max-w-[380px] h-[70vh] max-h-[560px] rounded-2xl bg-white border border-surface-border shadow-card-lg flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border" style={{ background: 'linear-gradient(135deg,#2621FF,#171254)' }}>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0"><Sparkles size={16} className="text-white" /></div>
            <div className="min-w-0">
              <div className="font-disp font-bold text-white text-sm leading-none mb-1">Boujie</div>
              <div className="text-[10px] font-mono text-white/75 uppercase tracking-wider">VoltSage Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'text-white' : 'bg-surface-subtle text-ink border border-surface-border'}`} style={m.role === 'user' ? { background: 'linear-gradient(135deg,#2621FF,#171254)' } : undefined}>
                  {m.content}
                  {m.toolCalls?.map((tc, j) => <ToolResultCard key={j} tc={tc} />)}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-surface-subtle border border-surface-border rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-brand-orange" />
                  <span className="text-xs font-mono text-ink-faint">Boujie is thinking…</span>
                </div>
              </div>
            )}
            {error && <div className="text-xs font-mono text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
          </div>

          <div className="border-t border-surface-border p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask Boujie anything…"
              disabled={busy}
              className="tool-input flex-1 text-sm disabled:opacity-60"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#2621FF,#171254)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
