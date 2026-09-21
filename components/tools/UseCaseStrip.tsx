import { Users, CheckCircle2 } from 'lucide-react'

export default function UseCaseStrip({ audience, useCases }: { audience: string; useCases: string[] }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 mb-8">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(38,33,255,.08)' }}>
          <Users size={16} className="text-brand-orange" />
        </div>
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-0.5">Who this assessment is for</div>
          <div className="text-sm font-mono text-ink font-medium">{audience}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-11">
        {useCases.map(u => (
          <div key={u} className="flex items-start gap-2 text-[12.5px] text-ink-muted leading-snug">
            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{u}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
