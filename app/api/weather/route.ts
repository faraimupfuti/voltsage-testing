import { NextRequest, NextResponse } from 'next/server'

// Weatherstack access key lives server-side only — never expose it to the
// client bundle. Set WEATHERSTACK_API_KEY in your environment (.env.local
// locally, or your host's env var settings in production).
const WEATHERSTACK_KEY = process.env.WEATHERSTACK_API_KEY
const DEFAULT_QUERY = 'Harare'

export async function GET(req: NextRequest) {
  if (!WEATHERSTACK_KEY) {
    return NextResponse.json({ ok: false, error: 'Weather is not configured.' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('city') || DEFAULT_QUERY).trim().slice(0, 100)

  // Weatherstack's free/basic tier is served over plain HTTP. That's fine
  // here — this request happens server-to-server, never in the browser.
  const url = `http://api.weatherstack.com/current?access_key=${WEATHERSTACK_KEY}&query=${encodeURIComponent(query)}&units=m&language=en`

  try {
    // Cached for 30 minutes so normal site traffic can't burn through a
    // metered API quota — weather doesn't need to be more real-time than that.
    const res = await fetch(url, { next: { revalidate: 1800 } })
    const data = await res.json()

    if (data?.error) {
      console.error('Weatherstack error:', data.error)
      return NextResponse.json({ ok: false, error: 'Weather data is temporarily unavailable.' }, { status: 502 })
    }

    const loc = data?.location
    const cur = data?.current
    if (!loc || !cur) {
      return NextResponse.json({ ok: false, error: 'Weather data is temporarily unavailable.' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      location: { name: loc.name, country: loc.country, localtime: loc.localtime },
      current: {
        tempC: cur.temperature,
        feelslikeC: cur.feelslike,
        description: cur.weather_descriptions?.[0] || '',
        icon: cur.weather_icons?.[0] || null,
        humidity: cur.humidity,
        windKph: cur.wind_speed,
        windDir: cur.wind_dir,
        cloudcover: cur.cloudcover,
        uvIndex: cur.uv_index,
        isDay: cur.is_day === 'yes',
        observationTime: cur.observation_time,
      },
    }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600' } })
  } catch (err) {
    console.error('Weather fetch failed:', err)
    return NextResponse.json({ ok: false, error: 'Weather data is temporarily unavailable.' }, { status: 502 })
  }
}
