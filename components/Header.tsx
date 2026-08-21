'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X, Zap } from 'lucide-react'
import { useLang } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLang()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const fn=()=>setScrolled(window.scrollY>40); window.addEventListener('scroll',fn); return ()=>window.removeEventListener('scroll',fn) },[])

  const NAV = [
    { label: t.nav.why, href: '/#why' }, { label: t.nav.problems, href: '/#problems' },
    { label: t.nav.sizing, href: '/#sizing' }, { label: t.nav.agricultural, href: '/#agricultural' },
    { label: t.nav.battery, href: '/#battery' }, { label: t.nav.articles, href: '/#articles' },
    { label: t.nav.contact, href: '/#contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?'bg-white/95 backdrop-blur-md shadow-sm border-b border-surface-border':'bg-white/80 backdrop-blur-sm'}`}>
      <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,#1B17FF,#14109E,#0f172a,#1e293b)'}}/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <Image src="/logo.png" alt="VoltSage Solutions — free solar sizing tools" width={170} height={36} priority className="h-8 w-auto sm:h-9"/>
        </a>
        <nav className="hidden lg:flex items-center gap-5">
          {NAV.map(n=><a key={n.href} href={n.href} className="text-[11px] font-mono uppercase tracking-widest text-ink-muted hover:text-brand-teal transition-colors">{n.label}</a>)}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher/>
          <a href="/#sizing" className="btn-primary"><Zap size={14}/> {t.nav.cta}</a>
        </div>
        <div className="lg:hidden flex items-center gap-1">
          <LanguageSwitcher compact/>
          <button onClick={()=>setOpen(v=>!v)} aria-label="Menu" className="p-2 rounded-lg text-ink-muted hover:bg-surface-subtle transition-all">
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>
      <div className={`lg:hidden bg-white border-b border-surface-border overflow-hidden transition-all duration-300 ${open?'max-h-96 opacity-100':'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-1">
          {NAV.map(n=><a key={n.href} href={n.href} onClick={()=>setOpen(false)} className="py-3 px-3 text-sm font-mono uppercase tracking-wider text-ink-muted hover:text-brand-teal hover:bg-surface-subtle rounded-xl transition-all">{n.label}</a>)}
          <a href="/#sizing" onClick={()=>setOpen(false)} className="mt-2 btn-primary justify-center">{t.nav.ctaMobile}</a>
        </div>
      </div>
    </header>
  )
}
