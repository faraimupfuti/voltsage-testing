/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette rebuilt around the VoltSage logo: electric blue + black.
        // Key names kept as orange/amber/teal/green for backward compatibility
        // with existing `brand-*` utility classes across the codebase.
        brand: { orange:'#1B17FF', amber:'#14109E', teal:'#0f172a', green:'#1e293b' },
        surface: { DEFAULT:'#ffffff', subtle:'#f8fafc', muted:'#f1f5f9', border:'#e2e8f0', border2:'#cbd5e1' },
        ink: { DEFAULT:'#0f172a', muted:'#475569', faint:'#94a3b8' },
        // Override Tailwind's stock "teal" and "green" scales so existing
        // bg-teal-*/text-teal-*/bg-green-*/text-green-* utilities render in
        // the new blue/black scheme without touching every component.
        teal: { 50:'#EEEDFF',100:'#D9D7FF',200:'#B8B4FF',300:'#8D88FF',400:'#5B55FF',500:'#1B17FF',600:'#1410CC',700:'#14109E',800:'#0A0880',900:'#060560' },
        green:{ 50:'#F8FAFC',100:'#F1F5F9',200:'#E2E8F0',300:'#CBD5E1',400:'#94A3B8',500:'#64748B',600:'#475569',700:'#334155',800:'#1E293B',900:'#0F172A' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
        disp: ['Syne','sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.06)',
        'card-md':'0 4px 24px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 40px rgba(0,0,0,0.10),0 2px 8px rgba(0,0,0,0.05)',
        'brand':  '0 4px 24px rgba(27,23,255,0.18)',
        'teal':   '0 4px 24px rgba(15,23,42,0.18)',
      },
      animation: { 'float':'float 6s ease-in-out infinite' },
      keyframes: { float:{ '0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-12px)'} } },
    },
  },
  plugins: [],
}
