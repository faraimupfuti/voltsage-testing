'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Mail, MessageSquare, Linkedin, Twitter, Facebook, Loader2 } from 'lucide-react'

export function ContactSection() {
  const [name,    setName]    = useState('')
  const [contact, setContact] = useState('')
  const [service, setService] = useState('Ask a Voltsage Expert')
  const [location,setLocation]= useState('')
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [errorMsg,setErrorMsg]= useState('')

  const submit = async () => {
    if (!name || !contact) { alert('Please add your name and contact details.'); return }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, service, location, message }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('sent')
      setName(''); setContact(''); setLocation(''); setMessage('')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Could not send your enquiry. Please email us directly.')
    }
  }

  const SERVICES = [
    { sub:'Energy Advisory Session', name:'Ask a Voltsage Expert', desc:'A one-on-one conversation with a VoltSage engineer. We help you understand your energy needs and what size system you actually require — before you commit to buying anything.' },
    { sub:'Check a quote you already have', name:'Solar Quote Review', desc:'Already received a quote from an installer? Send it to us. We check whether the equipment is the right size for your needs and whether the specification makes engineering sense — with nothing to sell you.' },
    { sub:'Ask us anything', name:'General Solar questions', desc:'Not sure where to start, or just have a question about solar, batteries or inverters? Ask us anything — no strings attached, and nothing to buy.' },
  ]

  return (
    <section id="contact" className="py-24 bg-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="section-eyebrow">Talk to us — after you've used the tools</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">
            Come to us first.<br /><span className="brand-text">Buy with confidence.</span>
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            Use the free sizing tools above to get your numbers. Then reach out if you want an engineer to review a quote, refine your sizing, or design your system from scratch.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {SERVICES.map((s,i) => (
            <div key={i} className="gradient-border rounded-2xl overflow-hidden">
              <div className="card-flat p-6 h-full flex flex-col">
                <div className="text-[10px] font-mono uppercase tracking-widest text-brand-teal mb-1">{s.sub}</div>
                <h3 className="font-disp font-bold text-xl text-ink uppercase mb-3">{s.name}</h3>
                <p className="text-ink-muted text-sm flex-1 mb-5">{s.desc}</p>
                <button onClick={()=>setService(s.name)}
                  className={`w-full py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${service===s.name?'btn-primary justify-center':'btn-secondary justify-center'}`}>
                  {service===s.name?'✓ Selected':'Select this service'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form + info */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card p-5 sm:p-8">
            <h3 className="font-disp font-bold text-2xl text-ink uppercase mb-6">Send an enquiry</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Full name *</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tendai Moyo" className="tool-input text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Phone or email *</label>
                  <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="+263 7… or you@email.com" className="tool-input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Service needed</label>
                  <select value={service} onChange={e=>setService(e.target.value)} className="tool-input text-sm">
                    {SERVICES.map(s=><option key={s.name}>{s.name}</option>)}
                    <option>Other / general enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Location</label>
                  <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Harare" className="tool-input text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-ink-faint block mb-1">Tell us about your site</label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
                  placeholder="What do you need to power? Do you have a quote already? What's your budget range?"
                  className="tool-input text-sm resize-none" />
              </div>
              <button onClick={submit} disabled={status==='sending'} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {status==='sending'?<Loader2 size={16} className="animate-spin"/>:<Mail size={16}/>} {status==='sending'?'Sending…':'Send enquiry'}
              </button>
              {status==='sent'&&<div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm font-mono text-teal-700">✓ Sent — we'll get back to you shortly.</div>}
              {status==='error'&&<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-mono text-red-500">{errorMsg} You can also email us directly at <a href="mailto:info@voltsage.co" className="underline">info@voltsage.co</a></div>}
            </div>
          </div>

          <div className="card p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-disp font-bold text-2xl text-ink uppercase mb-2">What VoltSage does</h3>
              <p className="text-ink-muted text-sm mb-6">We help individuals and businesses understand exactly what solar system they need — before they spend any money. Our tools are free. Our advice is independent. We earn nothing from equipment sales.</p>
              <div className="space-y-4">
                {[
                  { label:'Use our tools first',        desc:'Free residential, agricultural and battery runtime tools — no sign-up, no cost, available right now.' },
                  { label:'Get informed, not sold to',  desc:'We explain your numbers in plain language so you understand what you\'re buying before you buy it.' },
                  { label:'Compare quotes confidently', desc:'Walk into any installer conversation knowing your required inverter size, battery and PV array.' },
                  { label:'No conflict of interest',    desc:'We never profit from equipment. Our only product is helping you make the right decision.' },
                ].map((item,i)=>(
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[9px] font-bold"
                      style={{background:'linear-gradient(135deg,#1B17FF,#1e293b)'}}>✓</div>
                    <div>
                      <div className="font-mono text-xs font-bold text-ink uppercase tracking-wider">{item.label}</div>
                      <div className="text-ink-muted text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-surface-border">
              <p className="text-xs font-mono text-ink-faint mb-3 uppercase tracking-wider">Direct contact</p>
              <div className="space-y-2">
                <a href="mailto:info@voltsage.co" className="flex items-center gap-2 text-sm text-ink-muted hover:text-brand-teal transition-colors"><Mail size={14}/> info@voltsage.co</a>
                <a href="https://wa.me/263" className="flex items-center gap-2 text-sm text-ink-muted hover:text-brand-green transition-colors"><MessageSquare size={14}/> WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-surface-border py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="VoltSage Solutions — free solar sizing tools" width={170} height={36} className="h-8 w-auto"/>
            </div>
            <p className="text-ink-faint text-xs leading-relaxed max-w-xs">Use our free tools before you buy a solar system. Know your numbers. Make a confident decision. We sell no equipment — ever.</p>
          </div>
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-brand-teal mb-3">Free Tools</h5>
            <ul className="space-y-2 text-xs text-ink-faint">
              {[['Residential Sizing Tool','#sizing'],['Agricultural Sizing Tool','#agricultural'],['Battery Runtime Calculator','#battery']].map(([l,h])=>(
                <li key={l}><a href={h} className="hover:text-ink-muted transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-brand-orange mb-3">Services</h5>
            <ul className="space-y-2 text-xs text-ink-faint">
              {['Ask a Voltsage Expert','Solar Quote Review','General Solar questions'].map(s=>(
                <li key={s}><a href="/#contact" className="hover:text-ink-muted transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-brand-green mb-3">Learn</h5>
            <ul className="space-y-2 text-xs text-ink-faint">
              {['Why quotes vary','Surge demand explained','kW vs kVA','Battery technologies','Battery capacity','Solar vs generator'].map(a=>(
                <li key={a}><a href="/#articles" className="hover:text-ink-muted transition-colors">{a}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-ink-faint">© {new Date().getFullYear()} VoltSage Solutions Ltd · Preliminary sizing tools for planning purposes only — not a substitute for a detailed engineering assessment. · <a href="/network-design" className="underline hover:text-ink-muted transition-colors">Network Design</a> · <a href="/founders" className="underline hover:text-ink-muted transition-colors">Our Founder</a> · <a href="/privacy" className="underline hover:text-ink-muted transition-colors">Privacy Policy</a></p>
          <div className="flex gap-4">
            {[<Linkedin size={16} key="li"/>,<Twitter size={16} key="tw"/>,<Facebook size={16} key="fb"/>].map((icon,i)=>(
              <a key={i} href="#" className="text-ink-faint hover:text-brand-teal transition-colors">{icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
