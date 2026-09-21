/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // VoltSage identity: instrument-panel graphite, live-circuit indigo and
        // sun-copper accent. Key names kept as orange/amber/teal/green for
        // backward compatibility with existing `brand-*` utility classes.
        brand: { orange:'#2621FF', amber:'#171254', teal:'#0B1220', green:'#101A2E', copper:'#C6741E', copperLight:'#E89A4A' },
        surface: { DEFAULT:'#FFFFFF', subtle:'#FAF8F4', muted:'#F1EEE6', border:'#E4E0D5', border2:'#CFC9B8' },
        ink: { DEFAULT:'#0B1220', muted:'#4B5567', faint:'#8B93A3' },
        panel: { DEFAULT:'#0A0E17', soft:'#101627', line:'rgba(120,140,255,0.16)' },
        // Override Tailwind's stock "teal" and "green" scales so existing
        // bg-teal-*/text-teal-*/bg-green-*/text-green-* utilities render in
        // the new indigo/graphite scheme without touching every component.
        teal: { 50:'#EEEDFF',100:'#D9D7FF',200:'#B8B4FF',300:'#8D88FF',400:'#5B55FF',500:'#2621FF',600:'#1F1ACC',700:'#171254',800:'#0C0940',900:'#060530' },
        green:{ 50:'#F7F8FA',100:'#EFF1F4',200:'#DDE1E8',300:'#C2C8D3',400:'#8B93A3',500:'#5B6376',600:'#4B5567',700:'#333B4A',800:'#1A2030',900:'#0B1220' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
        disp: ['Syne','sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 2px rgba(11,18,32,0.04),0 10px 28px -12px rgba(11,18,32,0.14)',
        'card-md':'0 18px 45px -14px rgba(11,18,32,0.20)',
        'card-lg':'0 30px 70px -20px rgba(11,18,32,0.28)',
        'brand':  '0 10px 34px -8px rgba(38,33,255,0.35)',
        'copper': '0 10px 30px -8px rgba(198,116,30,0.35)',
        'teal':   '0 10px 30px -10px rgba(11,18,32,0.35)',
        'inset-line': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: { 'float':'float 6s ease-in-out infinite' },
      keyframes: { float:{ '0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-12px)'} } },
    },
  },
  plugins: [],
}
