'use client'
import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'

export default function Reveal({ children, delay = 0, className = '', style = {} }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`} style={{ ...style, transitionDelay: visible ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  )
}
