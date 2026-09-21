/**
 * Animated solar power-flow diagram (from solar_power_flow_animated.svg),
 * restyled to the VoltSage palette: indigo #2621FF live circuit, sun-copper
 * #C6741E / #E89A4A, cream surfaces, JetBrains Mono labels.
 *
 * Inline SVG (not <img>) so it inherits the page fonts and its SMIL
 * electron animations keep running. Only one instance should be mounted per
 * page because the gradient/filter ids are static.
 */
export default function SolarFlow({ className = '' }: { className?: string }) {
  const PV = 'M365 337H420Q445 337 445 312V205Q445 185 465 185H600V250'
  const BAT = 'M365 540H420Q445 540 445 515V480Q445 435 470 435'
  const LOAD = 'M730 355H835'

  return (
    <svg
      viewBox="35 55 1120 560"
      className={className}
      role="img"
      aria-labelledby="sf-title sf-desc"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="sf-title">Solar power system with flowing electricity</title>
      <desc id="sf-desc">
        A 4.0 kWp PV array and a 5.0 kWh battery feed a 5.0 kW inverter, which supplies a 2.8 kW peak home load.
        Glowing electricity particles travel along the cables.
      </desc>

      <defs>
        <linearGradient id="sf-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0C0940" />
          <stop offset="1" stopColor="#2621FF" />
        </linearGradient>
        <linearGradient id="sf-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F1EEE6" />
        </linearGradient>
        <filter id="sf-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sf-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0B1220" floodOpacity=".10" />
        </filter>

        {/* Reusable electricity particles */}
        <g id="sf-spark-blue">
          <circle r="6" fill="#2621FF" filter="url(#sf-glow)" />
          <circle r="2.5" fill="#FFFFFF" />
        </g>
        <g id="sf-spark-copper">
          <circle r="6" fill="#C6741E" filter="url(#sf-glow)" />
          <circle r="2.5" fill="#FFFFFF" />
        </g>

        <style>{`
          .sf-mono{font-family:'JetBrains Mono',ui-monospace,monospace}
          .sf-lbl{font-weight:500;font-size:22px;letter-spacing:.06em;fill:#8B93A3}
          .sf-val{font-weight:700;font-size:28px;fill:#0B1220}
          .sf-pill{font-weight:600;font-size:20px;letter-spacing:.06em}
          .sf-node{fill:url(#sf-box);stroke:#E4E0D5;stroke-width:2}
          .sf-cable{fill:none;stroke:#E4E0D5;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
          .sf-flow{fill:none;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:2 24;animation:sf-dash 1.4s linear infinite}
          .sf-icon{stroke:#0B1220;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;fill:none}
          .sf-pulse{animation:sf-pulse 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
          .sf-blink{animation:sf-blink 1.2s ease-in-out infinite}
          @keyframes sf-dash{to{stroke-dashoffset:-26}}
          @keyframes sf-pulse{0%,100%{opacity:.6;transform:scale(.92)}50%{opacity:1;transform:scale(1.06)}}
          @keyframes sf-blink{0%,100%{opacity:.35}50%{opacity:1}}
          @media (prefers-reduced-motion:reduce){
            .sf-pulse,.sf-blink,.sf-flow{animation:none}
            .sf-spark{display:none}
          }
        `}</style>
      </defs>

      {/* SUN */}
      <g transform="translate(150 150)">
        <circle r="34" fill="#E89A4A" className="sf-pulse" />
        <g stroke="#C6741E" strokeWidth="5" strokeLinecap="round">
          <path d="M0-57V-76" />
          <path d="M0 57V76" />
          <path d="M57 0H76" />
          <path d="M-57 0H-76" />
          <path d="M40-40L54-54" />
          <path d="M-40-40L-54-54" />
          <path d="M40 40L54 54" />
          <path d="M-40 40L-54 54" />
        </g>
      </g>

      {/* PV ARRAY */}
      <g filter="url(#sf-shadow)">
        <rect x="55" y="235" width="310" height="235" rx="18" className="sf-node" />
        <g transform="translate(92 268)">
          <rect width="236" height="135" rx="6" fill="url(#sf-panel)" stroke="#0B1220" strokeWidth="4" />
          <g stroke="#8D88FF" strokeWidth="2" opacity=".7">
            <path d="M59 0V135M118 0V135M177 0V135" />
            <path d="M0 45H236M0 90H236" />
          </g>
        </g>
        <text x="210" y="432" textAnchor="middle" className="sf-mono sf-lbl">PV ARRAY</text>
        <text x="210" y="460" textAnchor="middle" className="sf-mono sf-val">4.0 kWp</text>
      </g>

      {/* BATTERY */}
      <g filter="url(#sf-shadow)">
        <rect x="55" y="490" width="310" height="110" rx="18" className="sf-node" />
        <g transform="translate(92 519)">
          <rect width="95" height="58" rx="9" fill="#EEEDFF" stroke="#2621FF" strokeWidth="4" />
          <rect x="95" y="19" width="9" height="20" rx="3" fill="#2621FF" />
          <rect x="12" y="12" width="71" height="34" rx="5" fill="#2621FF" opacity=".18" />
          <path d="M27 29H68M47.5 11V47" className="sf-icon" />
          <circle cx="20" cy="29" r="4" fill="#2621FF" className="sf-blink" />
        </g>
        <text x="220" y="541" className="sf-mono sf-lbl">BATTERY</text>
        <text x="220" y="571" className="sf-mono sf-val">5.0 kWh</text>
      </g>

      {/* INVERTER */}
      <g filter="url(#sf-shadow)">
        <rect x="470" y="250" width="260" height="230" rx="24" className="sf-node" />
        <circle cx="600" cy="325" r="52" fill="#0B1220" />
        <path d="M616 274L578 333H602L584 378L632 313H606Z" fill="#E89A4A" className="sf-pulse" />
        <path
          d="M525 405H551L565 390L579 420L594 387L609 420L623 397L637 405H675"
          stroke="#2621FF"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="600" y="445" textAnchor="middle" className="sf-mono sf-lbl">INVERTER</text>
        <text x="600" y="472" textAnchor="middle" className="sf-mono sf-val">5.0 kW</text>
      </g>

      {/* HOME LOAD */}
      <g filter="url(#sf-shadow)">
        <rect x="835" y="250" width="300" height="230" rx="24" className="sf-node" />
        <g transform="translate(913 278)">
          <path d="M0 75L72 15L144 75V145H0Z" fill="#FFF3E7" stroke="#0B1220" strokeWidth="4" strokeLinejoin="round" />
          <path d="M58 145V98H86V145" fill="#fff" stroke="#0B1220" strokeWidth="4" />
          <rect x="18" y="82" width="28" height="26" rx="3" fill="#C6741E" opacity=".3" stroke="#0B1220" strokeWidth="3" />
          <path d="M112 84H130V108H112Z" fill="#C6741E" opacity=".3" stroke="#0B1220" strokeWidth="3" />
          <path d="M72 15L84 0L96 15" fill="#0B1220" />
        </g>
        <text x="985" y="445" textAnchor="middle" className="sf-mono sf-lbl">HOME LOAD</text>
        <text x="985" y="472" textAnchor="middle" className="sf-mono sf-val">2.8 kW pk</text>
      </g>

      {/* CABLES */}
      <path id="sf-pv" d={PV} className="sf-cable" />
      <path d={PV} className="sf-flow" stroke="#2621FF" />
      <path id="sf-bat" d={BAT} className="sf-cable" />
      <path d={BAT} className="sf-flow" stroke="#C6741E" />
      <path id="sf-load" d={LOAD} className="sf-cable" />
      <path d={LOAD} className="sf-flow" stroke="#2621FF" />

      {/* Electrons following the exact cable paths */}
      <g className="sf-spark">
        {[0, 0.75, 1.5].map((b) => (
          <use key={`pv${b}`} href="#sf-spark-blue">
            <animateMotion dur="2.2s" begin={`${b}s`} repeatCount="indefinite">
              <mpath href="#sf-pv" />
            </animateMotion>
          </use>
        ))}
        {[0, 0.6, 1.2].map((b) => (
          <use key={`bat${b}`} href="#sf-spark-copper">
            <animateMotion dur="1.8s" begin={`${b}s`} repeatCount="indefinite">
              <mpath href="#sf-bat" />
            </animateMotion>
          </use>
        ))}
        {[0, 0.3, 0.6].map((b) => (
          <use key={`load${b}`} href="#sf-spark-blue">
            <animateMotion dur=".9s" begin={`${b}s`} repeatCount="indefinite">
              <mpath href="#sf-load" />
            </animateMotion>
          </use>
        ))}
      </g>

      {/* Direction arrows */}
      <g>
        <path d="M590 232l10 15 10-15z" fill="#2621FF" />
        <path d="M457 425l10 10-10 10z" fill="#C6741E" />
        <path d="M790 345l15 10-15 10z" fill="#2621FF" />
      </g>

      {/* Status pills */}
      <g className="sf-mono sf-pill">
        <rect x="250" y="120" width="200" height="34" rx="17" fill="#FFF3E7" stroke="#E89A4A" strokeOpacity=".5" />
        <circle cx="272" cy="137" r="5.5" fill="#C6741E" className="sf-blink" />
        <text x="288" y="144" fill="#8A4F12">GENERATING</text>

        <rect x="625" y="192" width="150" height="34" rx="17" fill="#EEEDFF" stroke="#2621FF" strokeOpacity=".35" />
        <circle cx="647" cy="209" r="5.5" fill="#2621FF" className="sf-blink" />
        <text x="663" y="216" fill="#171254">ACTIVE</text>

        <rect x="900" y="200" width="170" height="34" rx="17" fill="#FFF3E7" stroke="#E89A4A" strokeOpacity=".5" />
        <circle cx="922" cy="217" r="5.5" fill="#C6741E" className="sf-blink" />
        <text x="938" y="224" fill="#8A4F12">POWER ON</text>
      </g>
    </svg>
  )
}
