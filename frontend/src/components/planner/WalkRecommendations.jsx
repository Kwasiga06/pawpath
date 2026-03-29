import { useState, useEffect } from 'react'

const intensityColor = {
  'Low': 'bg-green-100 text-green-700',
  'Low-Moderate': 'bg-lime-100 text-lime-700',
  'Moderate': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700',
  'Very High': 'bg-red-100 text-red-700',
}

export default function WalkRecommendations({ breed, weather }) {
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
      {/* Breed header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-paw-pink rounded-full flex items-center justify-center text-3xl">
          🐾
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Breed detected</p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">{breed}</h2>
        </div>
        <span className={`ml-auto text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-pill ${intensityColor[data.intensity] ?? 'bg-gray-100 text-gray-600'}`}>
          {data.intensity} Energy
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-paw-pink rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Walk Duration</p>
          <p className="font-display text-4xl text-paw-red">{data.duration}</p>
          <p className="text-sm text-gray-500">minutes</p>
        </div>
        <div className="bg-paw-blue-light/30 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Distance</p>
          <p className="font-display text-4xl text-paw-blue">{data.distance}</p>
          <p className="text-sm text-gray-500">miles</p>
        </div>
        <div className="bg-paw-cream rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best Time</p>
          <p className="font-display text-xl text-gray-800">{data.best_time}</p>
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="font-display text-xl uppercase tracking-tight text-gray-700 mb-3">Walk Tips</h3>
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
  )
}
