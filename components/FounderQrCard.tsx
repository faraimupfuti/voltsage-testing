'use client'
import { useState } from 'react'
import Image from 'next/image'
import { X, QrCode } from 'lucide-react'

export default function FounderQrCard() {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <>
      <button onClick={()=>setQrOpen(true)} className="group flex items-center gap-4 p-4 rounded-2xl border border-surface-border bg-surface-subtle hover:border-brand-orange/40 hover:shadow-card-md transition-all text-left w-full sm:w-auto">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-border flex-shrink-0 bg-white transition-transform group-hover:scale-105">
          <Image src="/nyasha-qr.png" alt="QR code with Nyasha Mpofu's contact details" fill className="object-cover"/>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink mb-0.5"><QrCode size={13} className="text-brand-orange"/> Scan to connect</div>
          <p className="text-xs text-ink-faint">Tap to view and scan Nyasha's contact card</p>
        </div>
      </button>

      {qrOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm" onClick={()=>setQrOpen(false)}>
          <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-xs bg-white rounded-2xl border border-surface-border shadow-card-lg p-6 text-center">
            <button onClick={()=>setQrOpen(false)} aria-label="Close" className="absolute top-4 right-4 text-ink-faint hover:text-ink transition-colors"><X size={18}/></button>
            <p className="font-disp font-bold text-base text-ink mb-1">Nyasha Mpofu</p>
            <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-5">Scan to save contact details</p>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-surface-border">
              <Image src="/nyasha-qr.png" alt="QR code with Nyasha Mpofu's contact details" fill className="object-cover"/>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
