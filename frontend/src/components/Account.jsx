import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useTransition } from '../lib/TransitionContext'

function Account() {
  const [user, setUser] = useState(undefined)
  const [dogs, setDogs] = useState([])
  const [walks, setWalks] = useState([])
  const navigate = useNavigate()
  const { transitionTo } = useTransition()

  useEffect(() => {
    async function init(u) {
      setUser(u)
      if (!u) {
        navigate('/', { replace: true })
        return
      }

      // Save pending dog from onboarding if present
      const pending = localStorage.getItem('pending_dog')
      if (pending) {
        localStorage.removeItem('pending_dog')
        try {
          const dog = JSON.parse(pending)
          const { error } = await supabase.from('dogs').insert({
            owner_id: u.id,
            name: dog.name || null,
            breed: dog.breed || null,
            size: dog.size || null,
            weight: dog.weight || null,
            age: dog.age || null,
          })
          if (error) console.error('Dog insert error:', error)
        } catch (e) { console.error('Dog insert exception:', e) }
      }

      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', u.id)
        .then(({ data }) => setDogs(data ?? []))

      supabase
        .from('walks')
        .select('*')
        .eq('owner_id', u.id)
        .order('started_at', { ascending: false })
        .limit(20)
        .then(({ data }) => setWalks(data ?? []))
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      init(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      init(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (user === undefined) return null

  const displayName = user.user_metadata?.full_name || user.email
  const avatar = user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Header */}
      <section className="bg-paw-cream px-6 py-16 border-b border-paw-pink">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          {avatar ? (
            <img src={avatar} alt="avatar" referrerPolicy="no-referrer" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-paw-pink flex items-center justify-center text-2xl">
              🐾
            </div>
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Your account</p>
            <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-ink">
              {displayName}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* My Dogs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Your pals</p>
              <h2 className="font-display text-4xl uppercase tracking-tight text-ink">My Dogs</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => transitionTo('/onboard', 'bg-paw-red')}
                className="border border-paw-red text-paw-red text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-paw-red hover:text-white transition-colors"
              >
                + Add Dog
              </button>
              <button
                onClick={() => transitionTo('/planner', 'bg-paw-cream')}
                className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
              >
                Plan My Walk
              </button>
            </div>
          </div>

          {dogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center">
              <span className="text-6xl mb-4">🐕</span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-ink mb-2">No dogs yet</h3>
              <p className="text-ink-mid text-sm leading-relaxed max-w-xs">
                Add your dog to get personalized walk recommendations tailored to their breed and age.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dogs.map((dog) => (
                <div key={dog.id} onClick={() => navigate(`/dog/${dog.id}`)} className="bg-white rounded-3xl p-6 flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-paw-pink flex items-center justify-center text-2xl flex-shrink-0">
                      🐾
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl uppercase tracking-tight text-ink">{dog.name}</h3>
                    {dog.breed && <p className="text-sm text-ink-mid">{dog.breed}</p>}
                    <div className="flex gap-3 mt-1">
                      {dog.age && <span className="text-xs text-ink-low">{dog.age}</span>}
                      {dog.weight && <span className="text-xs text-ink-low">{dog.weight}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Walk History */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Recent activity</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-ink">Walk History</h2>
          </div>

          {walks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center">
              <span className="text-5xl mb-4">🦮</span>
              <p className="text-ink-mid text-sm">No walks yet. Plan a walk and hit Start Walk!</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl divide-y divide-gray-100">
              {walks.map((w) => {
                const mins = Math.round((w.duration_seconds ?? 0) / 60)
                const miles = ((w.distance_meters ?? 0) / 1609.344).toFixed(2)
                const date = w.started_at
                  ? new Date(w.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null
                return (
                  <div key={w.id} className="flex items-center justify-between px-8 py-5 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{w.park_name ?? 'Walk'}</p>
                      <p className="text-xs text-ink-low mt-0.5">
                        {w.dog_name && <span className="mr-2">{w.dog_name}</span>}
                        {date}
                      </p>
                    </div>
                    <div className="flex gap-4 text-right flex-shrink-0">
                      <div>
                        <p className="text-xs text-ink-low uppercase tracking-widest">Dist</p>
                        <p className="text-sm font-semibold text-ink">{miles} mi</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-low uppercase tracking-widest">Time</p>
                        <p className="text-sm font-semibold text-ink">{mins} min</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Settings */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Preferences</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-ink">Settings</h2>
          </div>

          <div className="bg-white rounded-3xl divide-y divide-gray-100">
            {/* Email row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-low mb-0.5">Email</p>
                <p className="text-sm text-ink-high">{user.email}</p>
              </div>
            </div> 

            {/* Sign out row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-low mb-0.5">Session</p>
                <p className="text-sm text-ink-high">Signed in with Google</p>
              </div>
              <button
                onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
                className="text-xs font-semibold uppercase tracking-wide text-paw-red hover:text-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Account
