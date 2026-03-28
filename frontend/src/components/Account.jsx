import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Account() {
  const [user, setUser] = useState(undefined)
  const [dogs, setDogs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        navigate('/', { replace: true })
        return
      }

      // Save pending dog from onboarding if present
      const pending = localStorage.getItem('pending_dog')
      if (pending) {
        try {
          const dog = JSON.parse(pending)
          await supabase.from('dogs').insert({
            owner_id: u.id,
            name: dog.name || null,
            breed: dog.breed || null,
            size: dog.size || null,
            weight: dog.weight || null,
            age_y: parseFloat(dog.age) || null,
          })
        } catch {}
        localStorage.removeItem('pending_dog')
      }

      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', u.id)
        .then(({ data }) => setDogs(data ?? []))
    })
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
            <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
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
              <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">My Dogs</h2>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
            >
              Plan My Walk
            </button>
          </div>

          {dogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center">
              <span className="text-6xl mb-4">🐕</span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-gray-900 mb-2">No dogs yet</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
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
                    <h3 className="font-display text-xl uppercase tracking-tight text-gray-900">{dog.name}</h3>
                    {dog.breed && <p className="text-sm text-gray-500">{dog.breed}</p>}
                    <div className="flex gap-3 mt-1">
                      {(dog.age_y != null || dog.age_m != null) && (
                        <span className="text-xs text-gray-400">
                          {dog.age_y > 0 && `${dog.age_y} yr${dog.age_y !== 1 ? 's' : ''}`}
                          {dog.age_y > 0 && dog.age_m > 0 && ' '}
                          {dog.age_m > 0 && `${dog.age_m} mo`}
                          {dog.age_y === 0 && !dog.age_m && '< 1 mo'}
                        </span>
                      )}
                      {dog.weight != null && <span className="text-xs text-gray-400">{dog.weight} kg</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Preferences</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">Settings</h2>
          </div>

          <div className="bg-white rounded-3xl divide-y divide-gray-100">
            {/* Email row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
                <p className="text-sm text-gray-800">{user.email}</p>
              </div>
            </div> 

            {/* Units row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Distance units</p>
                <p className="text-sm text-gray-800">Kilometres</p>
              </div>
              <button className="text-xs font-semibold uppercase tracking-wide text-paw-blue hover:text-paw-red transition-colors">
                Change
              </button>
            </div>

            {/* Sign out row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Session</p>
                <p className="text-sm text-gray-800">Signed in with Google</p>
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
