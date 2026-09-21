'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, QrCode, X, Download, Copy, Check } from 'lucide-react'
// qr-code-styling ships its own type defs in most published versions; ts-ignore
// keeps the build resilient if a particular version's types are incomplete.
// @ts-ignore
import QRCodeStyling from 'qr-code-styling'

const QR_SIZE = 640

function buildQrCode(url: string) {
  return new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: 'canvas',
    data: url,
    margin: 12,
    qrOptions: { errorCorrectionLevel: 'H' },
    image: '/logo-icon.png',
    imageOptions: { crossOrigin: 'anonymous', margin: 10, imageSize: 0.4, hideBackgroundDots: true },
    dotsOptions: { type: 'dots', gradient: { type: 'linear', rotation: Math.PI / 4, colorStops: [{ offset: 0, color: '#2621FF' }, { offset: 1, color: '#171254' }] } },
    cornersSquareOptions: { type: 'extra-rounded', color: '#0B1220' },
    cornersDotOptions: { type: 'dot', color: '#2621FF' },
    backgroundOptions: { color: '#ffffff' },
  })
}

export function QrShareButton({ url, toolName }: { url: string; toolName: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<any>(null)

  useEffect(() => {
    if (!open || !containerRef.current) return
    containerRef.current.innerHTML = ''
    const qr = buildQrCode(url)
    qr.append(containerRef.current)
    qrRef.current = qr
  }, [open, url])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable — ignore */ }
  }

  const downloadPng = () => {
    qrRef.current?.download({ name: `voltsage-${toolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr`, extension: 'png' })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-faint hover:text-brand-teal transition-colors border border-surface-border hover:border-brand-teal/40 rounded-lg px-3 py-1.5">
        <QrCode size={13} /> Get QR code
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-xs bg-white rounded-2xl border border-surface-border shadow-card-lg p-6 text-center">
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-4 right-4 text-ink-faint hover:text-ink transition-colors"><X size={18} /></button>
            <p className="font-disp font-bold text-base text-ink mb-1">{toolName}</p>
            <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-5">Scan to open this tool directly</p>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-surface-border bg-white p-3 flex items-center justify-center">
              <div ref={containerRef} className="w-full h-full [&>canvas]:w-full [&>canvas]:h-full" />
            </div>
            <p className="mt-4 text-[11px] font-mono text-ink-faint break-all">{url}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={copyLink} className="flex-1 btn-teal justify-center text-[11px]">
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy link'}
              </button>
              <button onClick={downloadPng} className="flex-1 btn-primary justify-center text-[11px]">
                <Download size={13} /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ToolPageHeader({ toolName, url }: { toolName: string; url: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-2 flex flex-wrap items-center justify-between gap-3">
      <a href="/#sizing" className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-faint hover:text-ink transition-colors">
        <ArrowLeft size={13} /> All VoltSage tools
      </a>
      <QrShareButton url={url} toolName={toolName} />
    </div>
  )
}
