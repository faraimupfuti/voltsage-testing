export const SITE_URL = 'https://voltsage.co'

export const TOOL_LINKS = {
  residential: { path: '/tools/energy-assessment', name: 'Home Energy Assessment' },
  agricultural: { path: '/tools/farm-assessment', name: 'Farm Load Assessment' },
  battery: { path: '/tools/battery-assessment', name: 'Battery Runtime Assessment' },
  dcCable: { path: '/tools/cable-sizing', name: 'DC Cable Sizing Tool' },
} as const

export function toolUrl(key: keyof typeof TOOL_LINKS) {
  return `${SITE_URL}${TOOL_LINKS[key].path}`
}
