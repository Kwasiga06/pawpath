import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(seconds) {
  if (!seconds) return '0m'
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function metersToMiles(m) {
  return ((m ?? 0) / 1609.344).toFixed(2)
}

function calculateStreak(walks) {
  if (!walks.length) return 0
  const uniqueDays = [
    ...new Set(walks.map((w) => new Date(w.started_at).toDateString())),
  ]
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (uniqueDays.includes(d.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

export default function WalkHistory() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/')
        return
      }
      const { data } = await supabase
        .from('walks')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('started_at', { ascending: false })
      setWalks(data ?? [])
      setLoading(false)
    })
  }, [])

  const totalMiles = walks.reduce((acc, w) => acc + (w.distance_meters ?? 0), 0) / 1609.344
  const totalMinutes = Math.round(
    walks.reduce((acc, w) => acc + (w.duration_seconds ?? 0), 0) / 60
  )
  const streak = calculateStreak(walks)

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Page Header */}
      <div className="bg-white border-b border-paw-pink px-6 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">
          Your activity
        </p>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
          Walk <span className="text-paw-red">History</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Every walk tracked and saved.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Total Walks</p>
            <p className="font-display text-4xl text-paw-red">{walks.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Total Miles</p>
            <p className="font-display text-4xl text-paw-blue">{totalMiles.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              {streak > 0 ? 'Day Streak' : 'Total Time'}
            </p>
            {streak > 0 ? (
              <p className="font-display text-4xl text-gray-800">
                {streak}
                <span className="text-2xl ml-1">🔥</span>
              </p>
            ) : (
              <p className="font-display text-4xl text-gray-800">{totalMinutes}m</p>
            )}
          </div>
        </div>

        {/* Walk list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-paw-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : walks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center space-y-4">
            <span className="text-6xl">🐾</span>
            <p className="font-display text-2xl uppercase tracking-tight text-gray-700">
              No walks yet
            </p>
            <p className="text-gray-400 text-sm">
              Head to the planner, hit Start Walk, and your history will appear here.
            </p>
            <button
              onClick={() => navigate('/planner')}
              className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
            >
              Go to Planner
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {walks.map((walk) => (
              <div
                key={walk.id}
                className="bg-white rounded-2xl p-5 flex items-center gap-5"
              >
                <div className="w-11 h-11 bg-paw-pink rounded-full flex items-center justify-center text-xl shrink-0">
                  🐾
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {walk.dog_name ?? 'Unknown Dog'}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {walk.park_name
                      ? walk.park_name
                      : walk.breed ?? 'Walk'}{' '}
                    · {formatDate(walk.started_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl text-paw-red">
                    {metersToMiles(walk.distance_meters)} mi
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDuration(walk.duration_seconds)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
