// Mock weather data - replace with real API (OpenWeatherMap, AirVisual, etc.)
const mockWeather = {
  location: 'Los Angeles, CA',
  temp: 72,
  condition: 'Partly Cloudy',
  icon: '⛅',
  humidity: 48,
  wind: 7,
  aqi: 42,
  aqiLabel: 'Good',
  aqiColor: 'text-green-600 bg-green-100',
  walkScore: 92,
  walkLabel: 'Great day for a walk!',
}

export default function WeatherBar() {
  const w = mockWeather
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
            <p className="font-bold text-gray-800">{w.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Wind</p>
            <p className="font-bold text-gray-800">{w.wind} mph</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 uppercase tracking-wide text-xs mb-0.5">Air Quality</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${w.aqiColor}`}>
              {w.aqiLabel} ({w.aqi})
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
