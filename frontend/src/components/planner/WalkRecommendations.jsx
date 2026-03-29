import { useState, useEffect } from 'react'

const intensityColor = {
  'Low': 'bg-green-100 text-green-700',
  'Low-Moderate': 'bg-lime-100 text-lime-700',
  'Moderate': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700',
  'Very High': 'bg-red-100 text-red-700',
}

function WalkScoreBadge({ score }) {
  if (score == null) return null
  const color = score >= 80 ? 'text-green-600' : score >= 55 ? 'text-yellow-600' : 'text-red-600'
  const strokeColor = score >= 80 ? '#16a34a' : score >= 55 ? '#ca8a04' : '#dc2626'
  const label = score >= 80 ? 'Great' : score >= 55 ? 'Fair' : 'Poor'
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="24" cy="24" r={radius} fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>{score}</span>
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</p>
      <p className="text-xs text-gray-400 uppercase tracking-wide">Walk Score</p>
    </div>
  )
}

export default function WalkRecommendations({ breed, weather, routeData, routeLoading, routeError }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!breed) return

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setData(null)

    const params = new URLSearchParams({ breed })
    if (weather?.temp != null)      params.set('temp', weather.temp)
    if (weather?.condition != null) params.set('condition', weather.condition)
    if (weather?.aqi != null)       params.set('aqi', weather.aqi)

    fetch(`/api/walks/recommendations?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Could not load recommendations. Please try again.')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [breed, weather, retryCount])

  const warnings = routeData?.advisory?.warnings ?? []
  const notRecommended = routeData?.advisory?.recommendation === 'not_recommended'
  const walkScore = routeData?.walk_score ?? null
  const [distVal, distUnit] = routeData?.total_distance?.split(' ') ?? [`${data?.distance ?? '?'}`, 'mi']
  const [durVal, durUnit] = routeData?.total_duration?.split(' ') ?? [`${data?.duration ?? '?'}`, 'min']

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 mb-6 flex items-center gap-4 text-gray-400">
        <div className="w-6 h-6 border-2 border-paw-red border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-sm uppercase tracking-widest">Generating walk plan...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 mb-6 text-center">
        <p className="text-sm text-paw-red font-semibold uppercase tracking-widest">{error}</p>
        <button
          onClick={() => setRetryCount(c => c + 1)}
          className="mt-3 text-xs text-gray-400 hover:text-paw-red transition-colors uppercase tracking-wide"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-3xl p-8 mb-6">
      {routeError && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-500 text-center">
          Could not load route — showing estimated data.
        </div>
      )}
      {(notRecommended || warnings.length > 0) && (
        <div className={`mb-6 rounded-2xl p-4 border ${notRecommended ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${notRecommended ? 'text-red-500' : 'text-yellow-600'}`}>
            ⚠️ Walk Advisory
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className={`text-sm ${notRecommended ? 'text-red-700' : 'text-yellow-700'}`}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Breed header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-paw-pink rounded-full flex items-center justify-center text-3xl">
          🐾
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Breed detected</p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">{breed}</h2>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {routeLoading ? (
            <div className="w-8 h-8 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
          ) : (
            <WalkScoreBadge score={walkScore} />
          )}
          <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-pill ${intensityColor[data.intensity] ?? 'bg-gray-100 text-gray-600'}`}>
            {data.intensity} Energy
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-paw-pink rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Walk Duration</p>
          {routeLoading ? (
            <div className="flex justify-center py-3"><div className="w-5 h-5 border-2 border-paw-red border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <p className="font-display text-4xl text-paw-red">{durVal}</p>
              <p className="text-sm text-gray-500">{durUnit} · round trip</p>
            </>
          )}
        </div>
        <div className="bg-paw-blue-light/30 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Distance</p>
          {routeLoading ? (
            <div className="flex justify-center py-3"><div className="w-5 h-5 border-2 border-paw-blue border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <p className="font-display text-4xl text-paw-blue">{distVal}</p>
              <p className="text-sm text-gray-500">{distUnit}</p>
            </>
          )}
        </div>
        {data.best_time && (
          <div className="bg-paw-cream rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best Time</p>
            <p className="font-display text-xl text-gray-800">{data.best_time}</p>
          </div>
        )}
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-5">
        {routeData?.advisory?.walk_tips?.length > 0 && (
          <div>
            <h3 className="font-display text-xl uppercase tracking-tight text-gray-700 mb-3">Today's Tips</h3>
            <ul className="space-y-2">
              {routeData.advisory.walk_tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="mt-0.5">🌤️</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight text-gray-700 mb-3">Breed Tips</h3>
          <ul className="space-y-2">
            {data.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-paw-red mt-0.5">🐾</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
