import { useState, useEffect } from 'react'

function getAqiLabel(aqi) {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-600 bg-green-100' }
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-100' }
  return { label: 'Poor', color: 'text-red-600 bg-red-100' }
}

function getWalkScore(tempF, description) {
  const desc = description?.toLowerCase() ?? ''
  if (desc.includes('thunderstorm') || desc.includes('snow')) return { score: 20, label: 'Not ideal for a walk' }
  if (desc.includes('rain') || desc.includes('drizzle')) return { score: 45, label: 'Bring an umbrella' }
  if (tempF < 35 || tempF > 95) return { score: 40, label: 'Extreme temps — short walk only' }
  if (tempF < 50 || tempF > 85) return { score: 70, label: 'Decent day for a walk' }
  return { score: 92, label: 'Great day for a walk!' }
}

export default function WeatherBar() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords

          // Reverse geocode to city name
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const geoData = await geoRes.json()
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown'

          // Fetch weather + AQI from FastAPI backend
          const weatherRes = await fetch(
            `/api/weather/current?lat=${latitude}&lon=${longitude}`
          )
          const data = await weatherRes.json()

          const tempF = Math.round(data.temperature)
          const walk = getWalkScore(tempF, data.description)
          const aqiInfo = getAqiLabel(data.aqi ?? 0)

          setWeather({
            location: city,
            temp: tempF,
            condition: data.description,
            icon: (() => {
              const desc = data.description?.toLowerCase() ?? ''
              const hour = new Date().getHours()
              const isNight = hour < 6 || hour >= 20
              if (desc.includes('thunder')) return '⛈️'
              if (desc.includes('snow')) return '❄️'
              if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️'
              if (desc.includes('cloud')) return isNight ? '☁️' : '⛅'
              return isNight ? '🌙' : '☀️'
            })(),
            humidity: data.humidity != null ? `${data.humidity}%` : '--',
            wind: data.wind_speed != null ? `${Math.round(data.wind_speed)} mph` : '--',
            aqi: data.aqi ?? '--',
            aqiLabel: aqiInfo.label,
            aqiColor: aqiInfo.color,
            walkScore: walk.score,
            walkLabel: walk.label,
          })
        } catch {
          setError('Could not load weather')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied')
        setLoading(false)
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 flex items-center gap-4 text-gray-400">
        <div className="w-6 h-6 border-2 border-paw-red border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest">Fetching your local weather...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-3xl p-6 text-sm text-gray-400 text-center uppercase tracking-widest">
        {error ?? 'Weather unavailable'}
      </div>
    )
  }

  const w = weather
  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Location & condition */}
        <div className="flex items-center gap-4">
          <span className="text-4xl">{w.icon}</span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">{w.location}</p>
            <p className="font-display text-2xl uppercase tracking-tight text-gray-900">{w.temp}°F — {w.condition}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Humidity</p>
            <p className="font-bold text-gray-800">{w.humidity}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Wind</p>
            <p className="font-bold text-gray-800">{w.wind}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Air Quality</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${w.aqiColor}`}>
              {w.aqiLabel} · {w.aqi} / 500
            </span>
          </div>
        </div>

        {/* Walk score */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
          <span className="text-2xl">🐾</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Walk Score</p>
            <p className="font-display text-xl text-green-700">{w.walkScore}/100 — {w.walkLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
