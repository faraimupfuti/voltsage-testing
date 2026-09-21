# VoltSage Solutions — Light Theme

Built by Farai Mupfuti.

Clean white professional design of the VoltSage solar sizing platform.
Same tools, same content, different visual design.

## Tech stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS (light palette — white + orange/teal brand accents)
- Lucide React icons
- Framer Motion ready

## Local development
```bash
npm install
npm run dev   # → http://localhost:3000
```

## Boujie (site chat assistant)
Boujie is a chat widget (bottom-right, on every page) that answers questions about
VoltSage and can run the same sizing/battery-runtime calculations as the free tools,
via Claude tool-use — see `lib/boujie.ts`, `app/api/chat/route.ts`, `components/Boujie.tsx`.

It needs an Anthropic API key to work:
```bash
cp .env.example .env.local
# then set ANTHROPIC_API_KEY in .env.local (get one at https://console.anthropic.com)
```
Without a key set, the chat widget still renders but replies with a "not configured yet" message
instead of erroring the whole site. `ANTHROPIC_MODEL` is optional and defaults to `claude-sonnet-5`.

## Deploy to GitHub
```bash
git init
git add .
git commit -m "feat: voltsage-light initial build"
git remote add origin https://github.com/YOUR_USERNAME/voltsage-light.git
git push -u origin main
```

## Deploy on Render
1. Push to GitHub
2. Render → New → Web Service → connect repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Or use Docker (Render auto-detects Dockerfile)

## Deploy on Fly.io
```bash
fly auth login
fly launch
fly deploy
```

## Deploy on Heroku
```bash
heroku create voltsage-light
heroku stack:set container
git push heroku main
```

## Location, PSH and report details

- `lib/geoPsh.ts` — browser geolocation → place name → PSH. Table entry if the country (or Zimbabwe province) is in `PSH_TABLE`; otherwise NASA POWER long-term irradiance for the exact coordinates; otherwise a latitude-based estimate. If device location is blocked it falls back to an approximate network (IP) lookup, then to the default location. No API keys required.
- `components/SiteProvider.tsx` — shared detection state + the name / company / site-location captured for PDF reports (stored in the browser only).
- `components/tools/SiteTools.tsx` — `usePshSelection`, `PshSelect`, `LocationStatus`, `useReportDetails` used by every sizing tool.
- Geolocation requires HTTPS (or localhost).
